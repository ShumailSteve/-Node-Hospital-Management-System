$(document).ready(function() {
	
// LINE CHART

getMonthsDataAndBuildLineChart(); 

// BAR CHART
getMonthsDataAndBuildBarChart();

// Fetch data and build line chart (Patients per month)
 function getMonthsDataAndBuildLineChart () {
                  
                    fetch('/patients/perMonth').then( (doc) => {
                        doc.json().then ( 
                                        (arr) => {                                      
										var newData = arr.data;
										                                        
										 buildLineChart(newData);
                                })
                        });   
	};

// Fetch data and build bar chart (Patients per month as per disease)
function getMonthsDataAndBuildBarChart () {
                  
		fetch('/patients/diseasePerMonth').then( (doc) => {
			doc.json().then ( 
							(arr) => {                                      
							var feverData = arr.data[0];
							var cancerData = arr.data[1];
							var heartData = arr.data[2];
														
							 buildBarChart(feverData, cancerData, heartData);
					})
			});   
};



// Build line chart				
function buildLineChart(monthsData) {
	var lineChartData = {
		labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		datasets: [{
			label: "Patients",
			backgroundColor: "rgba(0, 158, 251, 0.5)",
			data: monthsData
		}]
	};
	
	var linectx = document.getElementById('linegraph').getContext('2d');
	window.myLine = new Chart(linectx, {
		type: 'line',
		data: lineChartData,
		options: {
			responsive: true,
			legend: {
				display: false,
			},
			tooltips: {
				mode: 'index',
				intersect: false,
			},
			scales: {
				yAxes: [{
					ticks: {
						suggestedMin: 0,
						suggestedMax: 10
					}
				}]
			}
		}
	});
}
	
// BAR CHART
// Build Bar chart				
function buildBarChart(feverData, cancerData, heartData) {
	var barChartData = {

		labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		datasets: [{
			label: 'Fever',
			backgroundColor: 'rgba(0, 158, 251, 0.7)',
			borderColor: 'rgba(0, 158, 251, 1)',
			borderWidth: 1,
			data: feverData
		}
		, {
			label: 'Cancer',
			backgroundColor: 'rgba(255, 0, 0, 0.7)',
			borderColor: 'rgba(255, 188, 53, 1)',
			borderWidth: 1,
			data: cancerData
		},
		{
			label: 'Heart',
			backgroundColor: 'rgba(255, 188, 53, 0.7)',
			borderColor: 'rgba(255, 188, 53, 1)',
			borderWidth: 1,
			data: heartData
		}]
	};

	var ctx = document.getElementById('bargraph').getContext('2d');
	window.myBar = new Chart(ctx, {
		type: 'bar',
		data: barChartData,
		options: {
			responsive: true,
			legend: {
				display: false,
			},
			scales: {
				yAxes: [{
					ticks: {
						suggestedMin: 0,
						suggestedMax: 10
					}
				}]
			}
		}
	});
}
    barChart();
    
    $(window).resize(function(){
        barChart();
    });
    
    function barChart(){
        $('.bar-chart').find('.item-progress').each(function(){
            var itemProgress = $(this),
            itemProgressWidth = $(this).parent().width() * ($(this).data('percent') / 100);
            itemProgress.css('width', itemProgressWidth);
        });
    };
});
