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

var priorities = ["Blocker","Critical","Major","Minor","Trivial"]
var mashPriorities = ["Critical","Medium","Minimal","Serious"]

//jira data
var jira_col = db.collection('jira_col');
console.log('jira_col initialized.');
//cached highcharts
var graph_col = db.collection('graph_col');
console.log('graph_col initialized.');

http.createServer(handler).listen("6969");

function loadData(user_project, categories, mash){
	var jira_data = [];
	if(mash){
		priorities = mashPriorities;
	}
	async.forEachSeries(categories, function(category, callback) {
		async.forEachSeries(priorities, function(priority, callback) {
			var key = (mash)?'mash' + "-" + category + "-" + priority:category + "-" + priority;
			var url = (mash)?'https://request.siteworx.com/rest/api/latest/search?jql=project=MASH%20AND%20' + user_project + '=' + category + '%20AND%20cf[10101]=' + priority + '%20AND%20resolution=unresolved&maxResults=1&os_username=...gecko&os_password=S!t3w0rx123':'https://request.siteworx.com/rest/api/latest/search?jql=' + user_project + '=' + category + '%20AND%20priority=' + priority + '%20AND%20resolution=unresolved&maxResults=1&os_username=...gecko&os_password=S!t3w0rx123';
			var ppu = {};
			ppu['key'] = key;
			ppu['user_project'] = category;
			ppu['priority'] = priority;
			ppu['url'] = url;
			ppu['mash'] = (mash)?true:false;
			jira_data.push(ppu);
			callback();
		});
		callback();
	});
	async.forEachSeries(jira_data, function(jd, callback) {
		request.get(jd.url, function(err, response, body){
			try{
				jd['value'] = JSON.parse(body).total;
				//console.log(JSON.stringify(jd));
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
	var mash = (u["query"]["mash"])?true:false;
	var key = u.search;
	try{
		loadData(user_proj, categories, mash);
	} catch(err) {
		res.writeHead(500, {'Content-Type':'text/plain'});
		res.end(err.stack);
		console.log(err.stack);
	}
	graph_col.findOne({'key':key},function(err,graph){
		try{
			//var graph = g;
			//preload chart w/o data
			if(graph == null){
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
				jira_col.find({'user_project':category,'mash':mash}).sort({priority:1},function(err, results) {
					async.forEachSeries(results, function(qr, callback){
						if(j==0){
							var n_d = {};
							n_d['name'] = qr.priority;
							n_d['data'] = new Array(categories.length);
							graph.data.series[i] = n_d;
						}
						graph.data.series[i].data[j]=(qr.value)?qr.value:0;
						graph_col.update({key: graph.key}, graph, {upsert:true});
						i++;
						callback();
					})
					j++;
				})
				callback();
			});
			res.writeHead(200, {'Content-Type':'text/plain'});
			res.end(JSON.stringify(graph.data));
		}catch(err) {
			res.writeHead(500, {'Content-Type':'text/plain'});
			res.end(err.stack);
			console.log(err.stack);
		}
	});
	graph = {};
}  
console.log('Server running at http://localhost:6969/');  
