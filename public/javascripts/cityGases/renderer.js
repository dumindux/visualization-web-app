var ctx = document.getElementById("canvas").getContext("2d");
jsondata = JSON.parse(jsondata);
jsondata = processJson();
fillCombo();

function refresh(event) {
    var city = this.options[this.selectedIndex].innerHTML;
    setDataset(selectedText);
}

function fillCombo() {
    var select = document.getElementById('combobox');
    var i = 0;
    for (var key in jsondata) {
        if (jsondata.hasOwnProperty(key)) {
            var opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = key;
            select.appendChild(opt);
            i++;
        }
    }
}

function processJson() {
    var result = {};
    for(var i = 0; i < jsondata.length; i++) {
        var cities = jsondata[i];
        var gas = cities[0];
        for(var j = 1; j < cities.length; j++){
            var city = cities[j][0];
            if(!result.hasOwnProperty(city)) {
                result[city] = [[],[]];
            }
            result[city][0].push(gas);
            result[city][1].push(cities[j][3]);
        }
    }
    return result;
}

function setDataset(city) {
    var data = {
        // labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
            {
                label: "My First dataset",
                fillColor: "#00FFFF",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "#0000FF",
                highlightStroke: "rgba(220,220,220,1)"//,
                // data: [65, 59, 80, 81, 56, 55, 40]
            }
        ]
    };

    var options = {
        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero : true,

        //Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - If there is a stroke on each bar
        barShowStroke : true,

        //Number - Pixel width of the bar stroke
        barStrokeWidth : 2,

        //Number - Spacing between each of the X value sets
        barValueSpacing : 5,

        //Number - Spacing between data sets within X values
        barDatasetSpacing : 1,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

    data["labels"] = jsondata[city][0];
    data["datasets"][0]["data"] = jsondata[city][1];
    var myBarChart = new Chart(ctx).Bar(data, options);
}

selectedText = $("#combobox option:selected").html();
setDataset(selectedText);