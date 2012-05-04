var d = new Date();
y = d.getFullYear();
m = d.getMonth() - 1;
if (m == 0){
	m = 12;
	y = y - 1;
}

var highcharts = { 
	basicBar:{
		chart: {
  	 	renderTo: 'container',
   		defaultSeriesType: 'bar',
	 		backgroundColor:"none"
		},
		title: {
	  	text: null 
		},
		subtitle: {
	  	text: null
		},
		xAxis: {
	  	categories: []
		},
		yAxis: {
	  	min: 0,
	  	title: {
	    	text: 'Open Issues'
	  	}
		},
		legend: {
	  	backgroundColor: '#FFFFFF',
	  	reversed: true
		},
		tooltip: {
	  	formatter: function() {
      	return '' + this.x + ': '+ this.y + ' mm';
	  	}	
		},
		plotOptions: {
	  	column: {
      	pointPadding: 0.2,
        borderWidth: 0
	  	}
		},
    series: []
	},
	stackedBar:{
		chart: {
	  	renderTo: 'container',
	  	defaultSeriesType: 'bar',
	  	backgroundColor: 'none'
		},
		title: {
	  	text: null
		},
		xAxis: {
	  	categories: []
		},
		yAxis: {
	  	min: 0,
	  	title: {
    		text: 'Total Issues'
	  	}
		},
		legend: {
	  	backgroundColor: '#FFFFFF',
	  	reversed: true
		},
		tooltip: {
	  	formatter: function() {
      	return '' + this.series.name + ': ' + this.y + '';
	  	}
		},
		plotOptions: {
	  	series: {
      	stacking: 'normal'
	  	}
		},
  	series: []
	},
	basicColumn: {
		chart: {
			renderTo: 'container',
			type: 'column',
	  	backgroundColor: 'none'
		},
		title: {
			text: null
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Total Issues'
			}
		},
		legend: {
	  	backgroundColor: '#FFFFFF',
	  	reversed: true
		},
		tooltip: {
			formatter: function() {
				return ''+
					this.x +': '+ this.y +' mm';
			}
		},
		plotOptions: {
			column: {
				pointPadding: 0.2,
				borderWidth: 0
			}
		},
  	series: []
	},
	stackedColumn: {
		chart: {
			renderTo: 'container',
			type: 'column',
	  	backgroundColor: 'none'
		},
		title: {
			text: null
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Total Issues'
			}
		},
		legend: {
	  	backgroundColor: '#FFFFFF',
	  	reversed: true
		},
		tooltip: {
			formatter: function() {
				return ''+
					this.x +': '+ this.y +' mm';
			}
		},
		plotOptions: {
	  	series: {
      	stacking: 'normal'
	  	}
		},
  	series: []
	},
	basicLine: {
		chart: {
		  renderTo: 'container',
		  defaultSeriesType: 'line',
		  marginRight: 0,
		  marginBottom: 20,
		  plotBackgroundColor: 'none',
	 		backgroundColor: 'none',
		  plotShadow: false
		},
		title: {
	  	text: null
		},
		legend: {
	  	enabled: true,
	  	backgroundColor: '#FFFFFF',
	  	verticalAlign: 'top'
		},
		xAxis: {
	  	type: 'datetime',
	  	gridLineColor: '#282828',
	  	gridLineWidth: 1,
	  	tickColor: '#444',
	  	lineWidth: 0,
	  	tickPixelInterval: 70
		},
		yAxis: {
	  	title: {
		  	text: null
			},
	  	gridLineColor: '#282828',
	  	gridLineWidth: 1,
	  	lineWidth: 0,
	  	tickWidth: 1,
	  	tickColor: '#444',
	  	tickPixelInterval: 20,
	  	startOnTick: false,
	  	endOnTick: false
  	},
  	colors: ['#CC2121','#566301'],
  	credits: {
  	enabled: false
  		},
		plotOptions: {
			line: {
	  		marker: {
	   			enabled: false
	  		}
			}
 		},
    series: [{
			name: 'Created',
			data: [0],
			pointStart: Date.UTC(y, m, d.getDate()),
			pointInterval: 86400000 
  	},
 		{
    	name: 'Closed',
			data: [0],
			pointStart: Date.UTC(y, m, d.getDate()),
			pointInterval: 86400000 
		}]
	}
};
exports.highcharts = highcharts;
