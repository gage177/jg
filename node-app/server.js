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

//default highcharts - w/o Data
constants_col = db.collection('constants_col');
constants_col.update({'key':'basicBar'}, highcharts.basicBar, {upsert:true});
constants_col.update({'key':'stackedBar'}, highcharts.stackedBar, {upsert:true});

//jira data
var jira_col = db.collection('jira_col');
//cached highcharts - w/ Data
var graph_col = db.collection('graph_col');

http.createServer(handler).listen("6969");

function loadData(projects){
	var urls = [];
	async.forEachSeries(projects, function(project, callback) {
		async.forEachSeries(priorities, function(priority, callback) {
			var key = project + "-" + priority;
			var url = 'https://request.siteworx.com/rest/api/latest/search?jql=project=' + project + '%20AND%20priority=' + priority + '%20&maxResults=1&os_username=...gecko&os_password=S!t3w0rx123';
			var ppu = {};
			ppu['key'] = key;
			ppu['project'] = project;
			ppu['priority'] = priority;
			ppu['url'] = url;
			urls.push(ppu);
			callback();
		}, function(err) {
  		// handle errors
		});
		callback();
	}, function(err) {
  	// handle errors
	});
	async.forEachSeries(urls, function(url, callback) {
		request.get(url.url, function(err, response, body){
			url['value'] = JSON.parse(body).total;
			jira_col.update({key: url.key}, url, {upsert:true});
		});
		callback();
	}, function(err) {
  	// handle errors
	});
}

function handler(req, res) {
	var u = url.parse(req.url, true);
  var user = u["query"]["user"];
  var projects_val = u["query"]["project"];
  var projects = (projects_val)?projects_val.split(","):[];
	var users_val = u["query"]["user"];
  var users = (users_val)?users_val.split(","):[];
	var chart = u["query"]["chart"];
	
	loadData(projects);
	var key = projects + "-" + chart;
	//preload a keyed chart w/o data
	graph_col.find({'key':key},function(err,g){
		constants_col.find({'key':chart},function(err,c){
			try{
			var graph = g[0];
			if(g.length == 0){
				var con_graph = {};
				con_graph['key'] = key;
				con_graph['data'] = c[0].data;
				graph_col.update({key: con_graph.key}, con_graph, {upsert:true});
				graph = con_graph;
			} 
			//labels for xAxis
			graph.data.xAxis.categories = projects;
			var j = 0;
			async.forEachSeries(projects, function(project, callback) {
				var i = 0;
				jira_col.find({'project':project}).sort({priority:1}, function(err, query_results) {
					async.forEachSeries(query_results, function(qr, callback) {
						//reset graph.data.series[i].data array...
						if(j==0){
							graph.data.series[i].data.length = 0;
						}
						graph.data.series[i].name = qr.priority;
						graph.data.series[i].data[j] = qr.value;
						i++;
						graph_col.update({key: graph.key}, graph, {upsert:true});
						callback();
					});
					j++;
				});
				callback();
			});

			graph_col.find({'key':key}).sort({key:1}, function(err, d) {
				res.writeHead(200, {'Content-Type':'text/plain'});
				res.end(JSON.stringify(d[0].data));
			});
			}catch(err){
				console.log(err.stack);
				res.writeHead(200, {'Content-Type':'text/plain'});
				res.end('Error');
			}
		});
	});
}  
console.log('Server running at http://localhost:6969/');  

//process.on('uncaughtException', function(err) {
//  console.log(err.stack);
	//res.writeHead(200, {'Content-Type':'text/plain'});
	//res.end('Error');
//});

