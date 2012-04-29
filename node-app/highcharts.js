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
	}
};
exports.highcharts = highcharts;
