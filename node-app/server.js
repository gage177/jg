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
var d = new Date();
y = d.getFullYear();
m = d.getMonth() - 1;
if (m == 0){
	m = 12;
	y = y - 1;
}

var priorities;
//jira data
var jira_col = db.collection('jira_col');
console.log('jira_col initialized.');

//cached highcharts
var graph_col = db.collection('graph_col');
console.log('graph_col initialized.');

//empty collections for testing
jira_col.remove();
console.log("jira_col emptied for testing.");
graph_col.remove();
console.log("graph_col emptied for testing.");

http.createServer(handler).listen("6969");

function loadLine(user_project, categories, graph){
	var tmpDay = 30;
	for (day=-30;day<=0;day++){
		(function(day) {
			setTimeout(function() {
				var keyDay = (tmpDay < 10 ? '-0' : '-') + tmpDay;
				var key = keyDay + "-" + categories;
				var openUrl = 'https://request.siteworx.com/rest/api/latest/search?jql='+user_project+'='+categories[0]+'%20AND%20created%3E'+day+'d%20AND%20created%3C'+(day+1)+'d&maxResults=1&os_username=...gecko&os_password=S!t3w0rx123';
				var closedUrl = 'https://request.siteworx.com/rest/api/latest/search?jql='+user_project+'='+categories[0]+'%20AND%20status%20in%20(Resolved,%20Closed)%20AND%20created%3E'+day+'d%20AND%20created%3C'+(day+1)+'d&maxResults=1&os_username=...gecko&os_password=S!t3w0rx123';
				var ppu = {};
				ppu['key'] = key;
				ppu['user_project'] = categories[0]+'-'+user_project;
				ppu['url'] = {'open':openUrl,'closed':closedUrl};
				request.get(ppu.url.open, function(err, response, body){
					try{
						ppu['openValue'] = JSON.parse(body).total;
						jira_col.update({key: ppu.key}, ppu, {upsert:true});
					}catch(err){
						console.log(err.stack);
					}
				});
				request.get(ppu.url.closed, function(err, response, body){
					try{
						ppu['closedValue'] = JSON.parse(body).total;
						jira_col.update({key: ppu.key}, ppu, {upsert:true});
					}catch(err){
						console.log(err.stack);
					}
				});
				tmpDay--;
			},0);
		})(day);
	}	

	if(graph.data.series.length == 0){
		graph.data.series[0] = {};
		graph.data.series[0]['data'] = [0];
		graph.data.series[0]['name'] = 'Created -';
		graph.data.series[0]['pointStart'] = Date.UTC(y, m, d.getDate());
	  graph.data.series[0]['pointInterval'] = 86400000;
		graph.data.series[1] = {};
		graph.data.series[1]['data'] = [0];
		graph.data.series[1]['name'] = 'Resolved - ';
		graph.data.series[1]['pointStart'] = Date.UTC(y, m, d.getDate());
	  graph.data.series[1]['pointInterval'] = 86400000;
	}
	var num = 1;
		(function(num){
			setTimeout(function(){
	jira_col.find({'user_project':categories[0]+'-'+user_project}).sort({'key':-1}).forEach(function(err, qr){
		if(!qr) return;
		graph.data.series[0].data[num] = qr.openValue + graph.data.series[0].data[num-1] ;
		graph.data.series[0].name = "Created - " + (qr.openValue + graph.data.series[0].data[num-1]);
		graph.data.series[1].data[num] = qr.closedValue + graph.data.series[1].data[num-1];
		graph.data.series[1].name = "Resolved - " + (qr.closedValue + graph.data.series[1].data[num-1]);
		graph_col.update({key: graph.key}, graph, {upsert:true});
		num++;
	});
			},0);
		})(num);
}

function loadBar(user_project, categories, mash, priorities, graph){
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
			request.get(ppu.url, function(err, response, body){
				try{
					ppu['value'] = JSON.parse(body).total;
					jira_col.update({key: ppu.key}, ppu, {upsert:true});
				}catch(err){
					console.log(err.stack);
				}
			});
			callback();
		});
		callback();
	});
	
	var i = 0;
	if(graph.data.series.length == 0){
	async.forEachSeries(priorities, function(priority, callback){
		graph.data.series[i] = {};
		graph.data.series[i]['name'] = priority;
		graph.data.series[i]['data'] = new Array(categories.length);
		//labels for xAxis
		graph.data.xAxis.categories = categories;
		i++;
		callback();
	});
	}
	
	var j = 0;
	async.forEachSeries(categories, function(category, callback){
		var i = 0;
		(function(j) {
			setTimeout(function() {
				jira_col.find({'user_project':category,'mash':mash}).sort({'priority':1}).forEach(function(err, qr){
					if(!qr) return;
					graph.data.series[i].data[j] = qr.value;
					graph_col.update({key: graph.key}, graph, {upsert:true});
					i++;
				});
			},0);
		})(j);
		j++;
		callback();
	});
}

function loadPie(user_project, categories, mash, priorities, graph){
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
			request.get(ppu.url, function(err, response, body){
				try{
					ppu['value'] = JSON.parse(body).total;
					jira_col.update({key: ppu.key}, ppu, {upsert:true});
				}catch(err){
					console.log(err.stack);
				}
			});
			callback();
		});
		callback();
	});
  if(graph.data.series.length == 0){	
	graph.data.series[0] = {};
	graph.data.series[0]['type'] = 'pie';
	graph.data.series[0]['name'] = '';
	graph.data.series[0]['data'] = new Array(categories.length);
	}
	
	var j = 0;
	jira_col.find({'user_project':categories[0],'mash':mash}).sort({'priority':1}).forEach(function(err, qr){
		if(!qr) return;
		graph.data.series[0].data[j] = [qr.priority, qr.value];
		graph_col.update({key: graph.key}, graph, {upsert:true});
		j++;
	});
}

function getStock(stock){
	request.get(stock.url, function(err, response, body){
		try{
			stock.data.item[0].value = parseFloat(body.toString().split(',')[1]);
   	 	stock.data.item[1].value = parseFloat(body.toString().split(',')[0]);
			graph_col.update({key: stock.key}, stock, {upsert:true});
		}catch(err){
			console.log(err.stack);
		}
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
	var stock = u["query"]["stock"];
	var mash = (u["query"]["mash"])?true:false;
	var key = u.search;
	var priorities =(mash)?["Critical","Medium","Minimal","Serious"]:["Blocker","Critical","Major","Minor","Trivial"];
	if(stock){
		graph_col.findOne({'key':key},function(err,graph){
			if(graph == null || graph.data == null){
				graph = {};
				graph['key'] = key;
				graph['data'] = { "item" : [{"text" : "", "value" : 0},{"text" : "", "value" : 0}]};
				graph['url'] = 'http://download.finance.yahoo.com/d/quotes.html?s=' + stock + '&f=ol1';
			}
			getStock(graph);
			res.writeHead(200, {'Content-Type':'text/plain'});
			res.end(JSON.stringify(graph.data));
		});
		graph = {};
	}else if(chart){
		graph_col.findOne({'key':key},function(err,graph){
		try{
			//preload chart w/o data
			if(graph == null || graph.data == null){
				graph = {};
				graph['key'] = key;
				graph['data'] = highcharts.highcharts[chart];
				graph.data.series.length = 0;
			}
			if(chart.indexOf("Column") != -1 || chart.indexOf("Bar") != -1){
				loadBar(user_proj, categories, mash, priorities, graph);
			}else if(chart.indexOf("Line") != -1){
				loadLine(user_proj, categories, graph);
			}else if(chart.indexOf("Pie") != -1){
				loadPie(user_proj, categories, mash, priorities, graph);
			}
			
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
		res.end("Missing Parameters\n"+JSON.stringify(u));
		console.log("Missing Parameters\n"+JSON.stringify(u));
	}
}  
console.log('Server running at http://localhost:6969/');  
