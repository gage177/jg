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
    series: [{
	  	name: 'Trivial',
	  	data: []
		}, {
	  	name: 'Minimal',
	  	data: []
		}, {
	  	name: 'Major',
	  	data: []
		}, {
	  	name: 'Critical',
	  	data: []
		}, {
	  	name: 'Blocker',
	  	data: []
		}]
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
  	series: [{
	  	name: 'Blocker',
	  	data: []
		}, {
	  	name: 'Critical',
	  	data: []
		}, {
	  	name: 'Major',
	  	data: []
		}, {
	  name: 'Minor',
	  data: []
		}, {
	  	name: 'Trivial',
	  	data: []
		}]
	},
	basicColumn{
		chart: {
			renderTo: 'container',
			type: 'column'
	  	backgroundColor: 'none'
		},
		title: {
			text: null;
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
  	series: [{
	  	name: 'Blocker',
	  	data: []
		}, {
	  	name: 'Critical',
	  	data: []
		}, {
	  	name: 'Major',
	  	data: []
		}, {
	  name: 'Minor',
	  data: []
		}, {
	  	name: 'Trivial',
	  	data: []
		}]
	}
	stackedColumn{
		chart: {
			renderTo: 'container',
			type: 'column'
	  	backgroundColor: 'none'
		},
		title: {
			text: null;
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
  	series: [{
	  	name: 'Blocker',
	  	data: []
		}, {
	  	name: 'Critical',
	  	data: []
		}, {
	  	name: 'Major',
	  	data: []
		}, {
	  name: 'Minor',
	  data: []
		}, {
	  	name: 'Trivial',
	  	data: []
		}]
	}
};
exports.highcharts = highcharts;
