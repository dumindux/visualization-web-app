jsondata = JSON.parse(jsondata);
jsondata = processJson();
fillCombo();

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
        for(var j = 0; j < cities[1].length; j+=5){
            var city = cities[1][j];
            console.log(city);
            if(!result.hasOwnProperty(city)) {
                result[city] = [];
            }
            var temp = {};
            temp["name"] = gas;
            temp["y"] = parseFloat(cities[1][j + 3]);
            result[city].push(temp);
        }
    }
    return result;
}

function refresh(event) {
    var city = this.options[this.selectedIndex].innerHTML;
    setDataset(city);
}

function setDataset(city){
    $(function () {
        // Create the chart
        $('#container').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'City wise pollution gas levels'
            },
            xAxis: {
                title: {
                    text:'Gases'
                },
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Gas Level(ppm)'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> ppm<br/>'
            },

            series: [{
                name: 'Gas',
                colorByPoint: true,
                data: jsondata[city]
            }]
        });
    });
}
selectedText = $("#combobox option:selected").html();
setDataset(selectedText);