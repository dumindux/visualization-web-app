var express = require('express');
var couchbase = require('couchbase');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/3dtimeline', function (req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents').limit(100);


    var bucket = cluster.openBucket('sync_gateway', function (err) {
        var jsonObjectOld = [["1990", [35, 27, 0.001, -17, 146, 0.004, -31, -54, 0.003, 3, 10, 0.020, 39, 103, 0.002]], ["2000", [, 18, 122, 0.015, -14, -45, 0.001, -3, 14, 0.001, -7, -49, 0.003, 30, 87, 0.000, -27, 28, 0.122, 42, 143, 0.006, 60, 22, 0.002, 32, 108, 0.051, -17, -40, 0.005, 31, -113, 0.001, 28, 39, 0.001, -30, -67, 0.002]]]

        if (err) {
            // Failed to make a connection to the Couchbase cluster.
            var jsonObject = [["1990", [35, 27, 0.001, -17, 146, 0.004, -31, -54, 0.003, 3, 10, 0.020, 39, 103, 0.002]], ["2000", [, 18, 122, 0.015, -14, -45, 0.001, -3, 14, 0.001, -7, -49, 0.003, 30, 87, 0.000, -27, 28, 0.122, 42, 143, 0.006, 60, 22, 0.002, 32, 108, 0.051, -17, -40, 0.005, 31, -113, 0.001, 28, 39, 0.001, -30, -67, 0.002]]]

            jsonObject = JSON.stringify(jsonObject);
            res.render('index', {
                title: 'Visualizations',
                data: jsonObject
            });
        } else {
            bucket.query(query, function (err, results) {
                if (err) {
                    throw err;
                }

                //var jsonObject = [["CO", []],["SO2", []]];

                var jsonObject = [];
                var gasesMap = {};
                var count = 0;

                for (var i = 0; i < results.length; i++) {

                    var singleValue = results[i].value;
                    var gases = singleValue.gases;

                    for (var j = 0; j < gases.length; j++) {
                        if (gasesMap[gases[j]] == undefined) {
                            gasesMap[gases[j]] = count;
                            jsonObject[count] = [];
                            jsonObject[count][0] = gases[j];
                            jsonObject[count][1] = [];
                            count++;
                        }

                        jsonObject[gasesMap[gases[j]]][1].push(singleValue.lat);
                        jsonObject[gasesMap[gases[j]]][1].push(singleValue.lon);
                        jsonObject[gasesMap[gases[j]]][1].push(parseInt(singleValue[gases[j]]));
                        jsonObject[gasesMap[gases[j]]][1].push(singleValue.Time);

                    }

                }

                jsonObject = JSON.stringify(jsonObject);
                res.render('index', {
                    title: '3D Timeline',
                    data: jsonObject
                });
            });
        }
    });
});

router.get('/home', function (req, res, next) {
    res.sendfile('views/home.html');
});

router.get('/', function (req, res, next) {
    //res.redirect('/home');
    res.sendfile('views/home.html');
});

router.get('/2ddotmap', function (req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents').limit(100);//.order(ViewQuery.Order.DESCENDING);
    var bucket = cluster.openBucket('sync_gateway', function (err) {

        if (err) {
            // Failed to make a connection to the Couchbase cluster.
            var jsonObject = [["1990", [35, 27, 0.001, -17, 146, 0.004, -31, -54, 0.003, 3, 10, 0.020, 39, 103, 0.002]], ["2000", [, 18, 122, 0.015, -14, -45, 0.001, -3, 14, 0.001, -7, -49, 0.003, 30, 87, 0.000, -27, 28, 0.122, 42, 143, 0.006, 60, 22, 0.002, 32, 108, 0.051, -17, -40, 0.005, 31, -113, 0.001, 28, 39, 0.001, -30, -67, 0.002]]]

            jsonObject = JSON.stringify(jsonObject);
            res.render('index', {
                title: 'Visualizations',
                data: jsonObject
            });
        } else {
            bucket.query(query, function (err, results) {
                if (err) {
                    throw err;
                }

                //var jsonObject = [["CO", []],["SO2", []]];

                var jsonObject = [];
                var gasesMap = {};
                var count = 0;

                for (var i = 0; i < results.length; i++) {

                    var singleValue = results[i].value;
                    var gases = singleValue.gases;

                    for (var j = 0; j < gases.length; j++) {
                        if (gasesMap[gases[j]] == undefined) {
                            gasesMap[gases[j]] = count;
                            jsonObject[count] = [];
                            jsonObject[count][0] = gases[j];
                            jsonObject[count][1] = [];
                            count++;
                        }

                        jsonObject[gasesMap[gases[j]]][1].push(singleValue.lat);
                        jsonObject[gasesMap[gases[j]]][1].push(singleValue.lon);
                        jsonObject[gasesMap[gases[j]]][1].push(parseInt(singleValue[gases[j]]));
                        jsonObject[gasesMap[gases[j]]][1].push(singleValue.Time);

                    }

                }

                jsonObject = JSON.stringify(jsonObject);
                res.render('2ddots', {
                    title: '2D Dot Map',
                    data: jsonObject
                });
            });
        }
    });
});

router.get('/average', function (req, res, next) {
    var jsonObject;

    var final = [["CO", []], ["SO2", []], ["NO2", []]];
    var cityValues = {}

    var clusterCity = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQueryCity = couchbase.ViewQuery;

    var queryCity = ViewQueryCity.from('cityData', 'cityData').limit(100);//.order(ViewQuery.Order.DESCENDING);
    var bucketAll = clusterCity.openBucket('air_pollution', function (err) {
        if (err) {

            console.log("error opening bucket city data" + err)

        } else {
            bucketAll.query(queryCity, function (err, results) {
                if (err) {
                    throw err;
                }
                console.log(JSON.stringify(results));
                for (var i = 0; i < results.length; i++) {
                    var cityData = results[i].value;
                    var city = cityData.city;
                    var max = parseFloat(cityData.max);
                    var lan = cityData.CityLan;
                    var lot = cityData.CityLon;
                    cityValues[city] = {"max": max, "lan": lan, "lot": lot};
                }
                console.log(cityValues);

                console.log("After");
                var cluster = new couchbase.Cluster('192.248.8.247:8091');
                var ViewQuery = couchbase.ViewQuery;
                var query = ViewQuery.from('cleaned_data_average', 'cleaned_data_average').limit(100);//.order(ViewQuery.Order.DESCENDING);
                var bucket = cluster.openBucket('air_pollution', function (err) {


                    if (err) {
                        // Failed to make a connection to the Couchbase cluster.
                        var jsonObject = [["CO", ["Colombo", 6.9270786, 79.861243, 34, 12500]], ["SO2", ["Colombo", 6.9270786, 79.861243, 100, 4000]]];
                        jsonObject = JSON.stringify(jsonObject);
                        console.log("error opening bucket city average" + err);


                    } else {
                        bucket.query(query, function (err, results) {
                            if (err) {
                                throw err;
                            }

                            console.log(JSON.stringify(results));
                            for (var i = 0; i < results.length; i++) {
                                var cityGasData = results[i].value;
                                var city = cityGasData.city;
                                var CO = parseFloat(cityGasData.COAvg);
                                var SO2 = parseFloat(cityGasData.SO2Avg);
                                var NO2 = parseFloat(cityGasData.NO2Avg);

                                var cityDataValues = cityValues[city];

                                var max = cityDataValues.max;
                                var lan = cityDataValues.lan;
                                var lot = cityDataValues.lot;

                                final[0][1].push(city);
                                final[0][1].push(lan);
                                final[0][1].push(lot);
                                final[0][1].push(CO);
                                final[0][1].push(max);

                                final[1][1].push(city);
                                final[1][1].push(lan);
                                final[1][1].push(lot);
                                final[1][1].push(SO2);
                                final[1][1].push(max);

                                final[2][1].push(city);
                                final[2][1].push(lan);
                                final[2][1].push(lot);
                                final[2][1].push(NO2);
                                final[2][1].push(max);


                            }
                            console.log(JSON.stringify(final));
                            res.render('average', {
                                title: 'City Level Pollution',
                                data: JSON.stringify(final)
                            });

                        });
                    }
                });
            });
        }

    });


});

/* GET heatmap page. */
router.get('/heatmap', function (req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents').limit(100);


    var bucket = cluster.openBucket('sync_gateway', function (err) {
        var jsonObjectOld = [["1990", [35, 27, 0.001, -17, 146, 0.004, -31, -54, 0.003, 3, 10, 0.020, 39, 103, 0.002]], ["2000", [, 18, 122, 0.015, -14, -45, 0.001, -3, 14, 0.001, -7, -49, 0.003, 30, 87, 0.000, -27, 28, 0.122, 42, 143, 0.006, 60, 22, 0.002, 32, 108, 0.051, -17, -40, 0.005, 31, -113, 0.001, 28, 39, 0.001, -30, -67, 0.002]]]

        if (err) {
            // Failed to make a connection to the Couchbase cluster.
            var jsonObject = [["1990", {lat: 35, lng: 27, count: 10}, {lat: -17, lng: 146, count: 0.004}, {
                lat: -31,
                lng: -54,
                count: 0.003
            }, {lat: 3, lng: 10, count: 0.020}, {lat: 39, lng: 103, count: 0.002}], ["2000", {
                lat: 18,
                lng: 122,
                count: 0.015
            }, {lat: -14, lng: -45, count: 0.001}, {lat: -3, lng: 14, count: 0.001}, {
                lat: -7,
                lng: -49,
                count: 0.003
            }, {lat: 30, lng: 87, count: 0.000}, {lat: -27, lng: 28, count: 0.122}, {
                lat: 42,
                lng: 143,
                count: 0.006
            }, {lat: 60, lng: 22, count: 0.002}, {lat: 32, lng: 108, count: 0.051}, {
                lat: -17,
                lng: -40,
                count: 0.005
            }, {lat: 31, lng: -113, count: 0.001}, {lat: 28, lng: 39, count: 0.001}, {
                lat: -30,
                lng: -67,
                count: 0.002
            }]]

            jsonObject = JSON.stringify(jsonObject);
            res.render('heatmap', {
                title: 'Heatmap of data',
                data: jsonObject
            });
        } else {
            bucket.query(query, function (err, results) {
                if (err) {
                    throw err;
                }

                //var jsonObject = [["CO", []],["SO2", []]];

                var jsonObject = {};
                var gasesMap = {};
                var count = 0;

                for (var i = 0; i < results.length; i++) {

                    var singleValue = results[i].value;
                    var gases = singleValue.gases;

                    for (var j = 0; j < gases.length; j++) {
                        if (jsonObject[gases[j]] == undefined) {
                            jsonObject[gases[j]] = [];
                        }
                        var values = [];
                        values.push(singleValue.lat);
                        values.push(singleValue.lon);
                        jsonObject[gases[j]].push(values);
                        //jsonObject[gasesMap[gases[j]]].push(singleValue.Time);
                    }
                }

                jsonObject = JSON.stringify(jsonObject);
                res.render('contributions', {
                    title: 'Contributions',
                    data: jsonObject
                });
            });
        }
    });
});

/*Example REST API http://localhost:3001/api?lat=6.800867&lon=79.900978 */
router.get('/api', function (req, res, next) {
    var lat = req.query.lat;
    var lon = req.query.lon;
    var latlon = lat + "," + lon;

    console.log(latlon);
    var city = "";

    if (lat != undefined && lon != undefined) {
        request("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlon + "&sensor=true", function (error, response, body) {
            var json = JSON.parse(body);
            var results = json["results"];
            var firstElement = results[0];
            if(firstElement != undefined) {
              var addressComponents = firstElement.address_components;
              //console.log(addressComponents);
              var cityFound = false;
              var givenCity = "";

              addressComponents.forEach(function (data) {

                  var type = data.types;
                  if (type[0] == "locality") {
                      givenCity = data.short_name;
                      cityFound = true;
                      console.log(data.short_name);

                      var cluster = new couchbase.Cluster('192.248.8.247:8091');
                      var ViewQuery = couchbase.ViewQuery;
                      var query = ViewQuery.from('average', 'all_average').limit(100);//.order(ViewQuery.Order.DESCENDING);
                      var bucket = cluster.openBucket('air_pollution', function (err) {


                          if (err) {
                              console.log("error opening bucket city average" + err);


                          } else {
                              bucket.query(query, function (err, results) {
                                  if (err) {
                                      throw err;
                                  }
                                  var found = false;
                                  for (var i = 0; i < results.length; i++) {
                                      var cityGasData = results[i].value;
                                      var city = cityGasData.city;

                                      if (givenCity == city) {
                                          found = true;
                                          var foudDataResponse = {};
                                          foudDataResponse.city = city;
                                          foudDataResponse.found = true;
                                          foudDataResponse.message = "Data found for given city";
                                          foudDataResponse.COAvg = parseFloat(cityGasData.COAvg);
                                          foudDataResponse.SO2Avg = parseFloat(cityGasData.SO2Avg);
                                          foudDataResponse.NO2Avg = parseFloat(cityGasData.NO2Avg);

                                          res.send(foudDataResponse);
                                          return;
                                      }
                                  }

                                  if (!found) {
                                      var notFoundGasDataResponse = {};
                                      notFoundGasDataResponse.city = givenCity;
                                      notFoundGasDataResponse.found = false;
                                      notFoundGasDataResponse.message = "Data for given city is not found"
                                      res.send(notFoundGasDataResponse);
                                      return;
                                  }
                                  //console.log(JSON.stringify(results));
                              })
                          }
                      });

                  }
              });
            } else {
              var notFoundGasDataResponse = {};
              notFoundGasDataResponse.city = givenCity;
              notFoundGasDataResponse.found = false;
              notFoundGasDataResponse.message = "Data for given city is not found"
              res.send(notFoundGasDataResponse);
              return;
            }
            if (!cityFound) {
                var cityNotFoundRespose = {};
                cityNotFoundRespose.city = givenCity;
                cityNotFoundRespose.found = false;
                cityNotFoundRespose.message = "Unable to find city"
                res.send(cityNotFoundRespose);
                return;
            }

            //console.log(json.getAttribute("address_components"));

        });
    } else {
        res.send("API Help: Send GET to /api?lat=xxx&lon=yyy where xxx = latitude and yyy = longitude. Return average gas values" +
            "of nearest city for given coordinates");
    }
});

router.get('/averageGMap', function (req, res, next) {
    var jsonObject;

    var final = [["CO", []], ["SO2", []], ["NO2", []]];
    var cityValues = {}

    var clusterCity = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQueryCity = couchbase.ViewQuery;

    var queryCity = ViewQueryCity.from('cityData', 'cityData').limit(100);//.order(ViewQuery.Order.DESCENDING);
    var bucketAll = clusterCity.openBucket('air_pollution', function (err) {
        if (err) {

            console.log("error opening bucket city data" + err)

        } else {
            bucketAll.query(queryCity, function (err, results) {
                if (err) {
                    throw err;
                }
                console.log(JSON.stringify(results));
                for (var i = 0; i < results.length; i++) {
                    var cityData = results[i].value;
                    var city = cityData.city;
                    var max = parseFloat(cityData.max);
                    var lan = cityData.CityLan;
                    var lot = cityData.CityLon;
                    cityValues[city] = {"max": max, "lan": lan, "lot": lot};
                }
                console.log(cityValues);

                console.log("After");
                var cluster = new couchbase.Cluster('192.248.8.247:8091');
                var ViewQuery = couchbase.ViewQuery;
                var query = ViewQuery.from('cleaned_data_average', 'cleaned_data_average').limit(100);//.order(ViewQuery.Order.DESCENDING);
                var bucket = cluster.openBucket('air_pollution', function (err) {


                    if (err) {
                        // Failed to make a connection to the Couchbase cluster.
                        var jsonObject = [["CO", ["Colombo", 6.9270786, 79.861243, 34, 12500]], ["SO2", ["Colombo", 6.9270786, 79.861243, 100, 4000]]];
                        jsonObject = JSON.stringify(jsonObject);
                        console.log("error opening bucket city average" + err);


                    } else {
                        bucket.query(query, function (err, results) {
                            if (err) {
                                throw err;
                            }

                            console.log(JSON.stringify(results));
                            for (var i = 0; i < results.length; i++) {
                                var cityGasData = results[i].value;
                                var city = cityGasData.city;
                                var CO = parseFloat(cityGasData.COAvg);
                                var SO2 = parseFloat(cityGasData.SO2Avg);
                                var NO2 = parseFloat(cityGasData.NO2Avg);

                                var cityDataValues = cityValues[city];

                                var max = cityDataValues.max;
                                var lan = cityDataValues.lan;
                                var lot = cityDataValues.lot;

                                final[0][1].push(city);
                                final[0][1].push(lan);
                                final[0][1].push(lot);
                                final[0][1].push(CO);
                                final[0][1].push(max);

                                final[1][1].push(city);
                                final[1][1].push(lan);
                                final[1][1].push(lot);
                                final[1][1].push(SO2);
                                final[1][1].push(max);

                                final[2][1].push(city);
                                final[2][1].push(lan);
                                final[2][1].push(lot);
                                final[2][1].push(NO2);
                                final[2][1].push(max);


                            }
                            console.log(JSON.stringify(final));
                            res.render('averageGMap', {
                                title: 'City Level Pollution',
                                data: JSON.stringify(final)
                            });

                        });
                    }

                });
            });
        }

    });
});
module.exports = router;
