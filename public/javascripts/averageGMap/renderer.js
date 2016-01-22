var map;
jsondata = JSON.parse(jsondata);
var circles = [];
var points = [];

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 6.8, lng: 80 },
    zoom:10,
  });

//  map.data.setStyle(styleFeature);

  select = document.getElementById('combobox');
  for(var i = 0; i < jsondata.length; i++) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = jsondata[i][0];
    select.appendChild(opt);
  }

  addMarkers(0);
}

function refresh(event) {
  updateLegend(constants[this.options[this.selectedIndex].innerHTML]);
  addMarkers(this.selectedIndex);
}

function updateLegend(values) {
  //console.log($("#text1").textContent);
  $("#text1").text(values[0] + " ppm");
  $("#text2").text(values[1] + " ppm");
  $("#text3").text(values[2] + " ppm");
  $("#text4").text(values[3] + " ppm");
}

function addMarkers(index) {
  removeMarkers();

  var infowindow = new google.maps.InfoWindow();
  for (var i = 0; i < jsondata[0][1].length; i++) {
    if(jsondata[index][1][3] < constants[jsondata[index][0]][1]) {
      color = "#65C68A";
    } else if (jsondata[index][1][3] < constants[jsondata[index][0]][2]) {
      color = "#FEE665";
    } else if (jsondata[index][1][3] < constants[jsondata[index][0]][3]) {
      color = "#FEB065";
    } else {
      color = "#FE6465";
    }

    var cityCircle = new google.maps.Circle({
      strokeColor: '#fff',
      strokeWeight: 0.5,
      fillColor: color,
      fillOpacity: 30 / jsondata[index][1][3] ,
      animation: google.maps.Animation.DROP,
      map: map,
      center: new google.maps.LatLng(jsondata[index][1][1], jsondata[index][1][2]),
      radius: jsondata[index][1][3] * 100
    });
    circles.push(cityCircle);

    var point = new google.maps.Marker({
      position: new google.maps.LatLng(jsondata[index][1][1], jsondata[index][1][2]),
      label: jsondata[index][1][0],
      animation: google.maps.Animation.DROP,
      map: map
    });
    makeInfoWindowEvent(map, infowindow, jsondata[index][1][3] + " ppm", point);
    points.push(point);
  }
}

function removeMarkers() {
  for (var i = 0; i < circles.length; i++) {
    circles[i].setMap(null);
    points[i].setMap(null);
  }
  circles = [];
  points = [];
}

function makeInfoWindowEvent(map, infowindow, contentString, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}

var mapStyle = [{
  'featureType': 'all',
  'elementType': 'all',
  'stylers': [{'visibility': 'off'}]
}, {
  'featureType': 'landscape',
  'elementType': 'geometry',
  'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
}, {
  'featureType': 'water',
  'elementType': 'labels',
  'stylers': [{'visibility': 'off'}]
}, {
  'featureType': 'water',
  'elementType': 'geometry',
  'stylers': [{'visibility': 'on'}, {'hue': '#5f94ff'}, {'lightness': 60}]
}];

initMap();
selectedText = $("#combobox option:selected").html(); //updates the legend after the initial load
updateLegend(constants[selectedText])
