var https = require('https');
var http = require('http');
var async = require('async');
var request = require('request');
var url = require('url');
var db = require('mongojs').connect('geckoboard');
var highcharts = require('./highcharts');
http.Agent.defaultMaxSockets = 200;
https.Agent.defaultMaxSockets = 200;
var db = require('mongojs').connect('geckoboard');

var priorities = ["Blocker","Critical","Major","Minor","Trivial"];

//jira data
var jira_col = db.collection('jira_col');
//cached highcharts - w/ Data
var graph_col = db.collection('graph_col');

http.createServer(handler).listen("6969");

function loadData(user_project, categories){
	var jira_data = [];
	async.forEachSeries(categories, function(category, callback) {
		async.forEachSeries(priorities, function(priority, callback) {
			var key = category + "-" + priority;
			var url = 'https://request.siteworx.com/rest/api/latest/search?jql=' + user_project + '=' + category + '%20AND%20priority=' + priority + '%20&maxResults=1&os_username=...gecko&os_password=S!t3w0rx123';
			var ppu = {};
			ppu['key'] = key;
			ppu['user_project'] = category;
			ppu['priority'] = priority;
			ppu['url'] = url;
			jira_data.push(ppu);
			callback();
		});
		callback();
	});
	async.forEachSeries(jira_data, function(jd, callback) {
		request.get(jd.url, function(err, response, body){
			try{
				jd['value'] = JSON.parse(body).total;
				jira_col.update({key: jd.key}, jd, {upsert:true});
			}catch(err){
				console.log(err.stack);
			}
		});
		callback();
	});
}

function handler(req, res) {
	var u = url.parse(req.url, true);
  var user = u["query"]["user"];
  var project_val = (u["query"]["project"])?u["query"]["project"]:"";
	var user_val = (u["query"]["user"])?u["query"]["user"]:"";
	var user_proj = (user_val)?'assignee':'project';
  var categories = (user_val)?user_val.split(","):project_val.split(",");
	var chart = u["query"]["chart"];
	try{
		loadData(user_proj, categories);
	} catch(err) {
		res.writeHead(500, {'Content-Type':'text/plain'});
		res.end(err.stack);
	}
	var key = categories + "-" + chart;
	graph_col.find({'key':key},function(err,g){
		try{
			var graph = g[0];
			//preload a keyed chart w/o data
			if(g.length == 0 || g.data == null){
				var con_graph = {};
				con_graph['key'] = key;
				con_graph['data'] = highcharts.highcharts[chart];
				graph_col.update({key: con_graph.key}, con_graph, {upsert:true});
				graph = con_graph;
			} 
			//labels for xAxis
			graph.data.xAxis.categories = categories;
			var j = 0;
			async.forEachSeries(categories, function(category, callback) {
				var i = 0;
				jira_col.find({'user_project':category}).sort({priority:1}, function(err, results) {
					async.forEachSeries(results, function(qr, callback){
						graph.data.series[i].name = qr.priority;
						if(j==0){graph.data.series[i].data.length = 0;}
						graph.data.series[i++].data[j] = qr.value;
						graph_col.update({key: graph.key}, graph, {upsert:true});
						callback();
					})
					j++;
				})
				callback();
			});
			graph_col.find({'key':key}).sort({key:1}, function(err, d) {
				res.writeHead(200, {'Content-Type':'text/plain'});
				res.end(JSON.stringify(d[0].data));
			});
		}catch(err) {
			res.writeHead(500, {'Content-Type':'text/plain'});
			res.end(err.stack);
		}
	});
	graph = {};
}  
console.log('Server running at http://localhost:6969/');  
