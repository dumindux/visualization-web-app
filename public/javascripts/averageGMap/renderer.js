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

function changeMarkers(event) {
  addMarkers(this.selectedIndex);
}

function addMarkers(index) {
  removeMarkers();
  var low = [151, 83, 34];   // color of mag 1.0
  var high = [5, 69, 54];  // color of mag 6.0 and above
  var minMag = 1.0;
  var maxMag = 1000;

  for (var i = 0; i < jsondata[0][1].length; i++) {
    var fraction = (Math.min(jsondata[index][1][3], maxMag) - minMag) /
        (maxMag - minMag);
    var color = interpolateHsl(low, high, fraction);

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

function interpolateHsl(lowHsl, highHsl, fraction) {
  var color = [];
  for (var i = 0; i < 3; i++) {
    // Calculate color based on the fraction.
    color[i] = (highHsl[i] - lowHsl[i]) * fraction + lowHsl[i];
  }

  return 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)';
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
