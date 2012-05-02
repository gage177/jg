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

var priorities;
//jira data
var jira_col = db.collection('jira_col');
console.log('jira_col initialized.');

//cached highcharts
var graph_col = db.collection('graph_col');
console.log('graph_col initialized.');

//empty collections for testing
jira_col.remove();
graph_col.remove();
console.log("jira_col & graph_col emptied for testing.");


http.createServer(handler).listen("6969");

function loadData(user_project, categories, mash, priorities){
	var jira_data = [];
	async.forEachSeries(categories, function(category, callback) {
		async.forEachSeries(priorities, function(priority, callback) {
			var key = category + "-" + priority;
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
	var priorities =(mash)?["Critical","Medium","Minimal","Serious"]:["Blocker","Critical","Major","Minor","Trivial"]
	if(chart){
	try{
		loadData(user_proj, categories, mash, priorities);
	} catch(err) {
		res.writeHead(500, {'Content-Type':'text/plain'});
		res.end(err.stack);
		console.log(err.stack);
	}
	graph_col.findOne({'key':key},function(err,graph){
		try{
			//preload chart w/o data
			if(graph == null || graph.data == null){
				graph = {};
				graph['key'] = key;
				graph['data'] = highcharts.highcharts[chart];
				var i = 0;
				async.forEachSeries(priorities, function(priority, callback){
					graph.data.series[i] = {};
					graph.data.series[i]['name'] = priority;
					graph.data.series[i]['data'] = (mash)?new Array(4):new Array(5);
					i++;
					callback();
				});
				graph_col.update({key: graph.key}, graph, {upsert:true});
			} 
			//labels for xAxis
			graph.data.xAxis.categories = categories;
			var j = 0;
			async.forEachSeries(categories, function(category, callback){
				var i = 0;
				(function(j) {
					setTimeout(function() {
						jira_col.find({'user_project':category,'mash':mash}).sort({'priority':1}).forEach(function(err, qr){
							if(!qr) return;
							graph.data.series[i]['name'] = qr.priority;
							graph.data.series[i].data[j] = qr.value;
							i++;
							//console.log(j +":"+JSON.stringify(qr.key +":"+qr.value));
							//console.log(JSON.stringify(graph.data.series));
							graph_col.update({key: graph.key}, graph, {upsert:true});
						});
					},0);
				})(j);
				j++;
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
	}else{
		res.writeHead(500, {'Content-Type':'text/plain'});
		res.end("Missing Parameters");
		console.log("Missing Parameters");
	}
}  
console.log('Server running at http://localhost:6969/');  
