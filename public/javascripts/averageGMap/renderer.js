var map;
jsondata = JSON.parse(jsondata);

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 6.8, lng: 80 },
    zoom:10,
    styles: mapStyle
  });

//  map.data.setStyle(styleFeature);

  var low = [151, 83, 34];   // color of mag 1.0
  var high = [5, 69, 54];  // color of mag 6.0 and above
  var minMag = 1.0;
  var maxMag = 1000;



  for(var i = 0; i < jsondata[0][1].length; i++) {
    var fraction = (Math.min(jsondata[0][1][3], maxMag) - minMag) /
        (maxMag - minMag);
    var color = interpolateHsl(low, high, fraction);

    var cityCircle = new google.maps.Circle({
      strokeColor: '#fff',
      strokeWeight: 0.5,
      fillColor: color,
      fillOpacity: 30 / jsondata[0][1][3] ,
      map: map,
      center: new google.maps.LatLng(jsondata[0][1][1], jsondata[0][1][2]),
      radius: jsondata[0][1][3] * 100
    });
  }

  // Get the earthquake data (JSONP format)
  // This feed is a copy from the USGS feed, you can find the originals here:
  //   http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
  //var script = document.createElement('script');
  //script.setAttribute('src',
  //  'https://storage.googleapis.com/maps-devrel/quakes.geo.json');
  //document.getElementsByTagName('head')[0].appendChild(script);
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
