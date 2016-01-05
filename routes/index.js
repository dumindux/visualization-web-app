var express = require('express');
var couchbase = require('couchbase');
var router = express.Router();

/* GET home page. */
router.get('/home/3dtimeline', function(req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents').limit(100);



    var bucket = cluster.openBucket('sync_gateway', function(err) {
        var jsonObjectOld = [["1990", [35, 27, 0.001, -17, 146, 0.004, -31, -54, 0.003, 3, 10, 0.020, 39, 103, 0.002]], ["2000", [, 18, 122, 0.015, -14, -45, 0.001, -3, 14, 0.001, -7, -49, 0.003, 30, 87, 0.000, -27, 28, 0.122, 42, 143, 0.006, 60, 22, 0.002, 32, 108, 0.051, -17, -40, 0.005, 31, -113, 0.001, 28, 39, 0.001, -30, -67, 0.002]]]

        if (err) {
            // Failed to make a connection to the Couchbase cluster.
            var jsonObject = [ ["1990",[35,27,0.001,-17,146,0.004,-31,-54,0.003,3,10,0.020,39,103,0.002]],["2000",[,18,122,0.015,-14,-45,0.001,-3,14,0.001,-7,-49,0.003,30,87,0.000,-27,28,0.122,42,143,0.006,60,22,0.002,32,108,0.051,-17,-40,0.005,31,-113,0.001,28,39,0.001,-30,-67,0.002]]]

            jsonObject = JSON.stringify(jsonObject);
            res.render('index', { title: 'Visualizations',
                data: jsonObject});
        } else {
            bucket.query(query, function(err, results) {
                if(err) {
                    throw err;
                }

                //var jsonObject = [["CO", []],["SO2", []]];

                var jsonObject = [];
                var gasesMap = {};
                var count = 0;

                for (var i = 0; i < results.length; i++) {

                    var singleValue = results[i].value;
                    var gases = singleValue.gases;

                    for (var j=0;j<gases.length;j++) {
                        if(gasesMap[gases[j]]==undefined){
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
                res.render('index', { title: '3D Timeline',
                    data: jsonObject});
            });
        }
    });
});

router.get('/home', function(req, res, next) {
    res.sendfile('views/home.html');
});

router.get('/',function(req,res,next){
    res.redirect('/home');
});

router.get('/home/2ddotmap', function(req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents').limit(100);



    var bucket = cluster.openBucket('sync_gateway', function(err) {
        if (err) {
            // Failed to make a connection to the Couchbase cluster.
            var jsonObject = [ ["1990",[35,27,0.001,-17,146,0.004,-31,-54,0.003,3,10,0.020,39,103,0.002]],["2000",[,18,122,0.015,-14,-45,0.001,-3,14,0.001,-7,-49,0.003,30,87,0.000,-27,28,0.122,42,143,0.006,60,22,0.002,32,108,0.051,-17,-40,0.005,31,-113,0.001,28,39,0.001,-30,-67,0.002]]]

            jsonObject = JSON.stringify(jsonObject);
            res.render('index', { title: 'Visualizations',
                data: jsonObject});
        } else {
            bucket.query(query, function(err, results) {
                if(err) {
                    throw err;
                }

                //var jsonObject = [["CO", []],["SO2", []]];

                var jsonObject = [];
                var gasesMap = {};
                var count = 0;

                for (var i = 0; i < results.length; i++) {

                    var singleValue = results[i].value;
                    var gases = singleValue.gases;

                    for (var j=0;j<gases.length;j++) {
                        if(gasesMap[gases[j]]==undefined){
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
                res.render('2ddots', { title: '2D Dot Map',
                    data: jsonObject});
            });
        }
    });
});

router.get('/home/average',function(req,res,next){
    var jsonObject = [["CO", ["Colombo", 6.9270786, 79.861243, 34, 12500]], ["SO2", ["Colombo", 6.9270786, 79.861243, 100, 4000]]];
    jsonObject = JSON.stringify(jsonObject);
    res.render('average', { title: 'City Level Pollution',
        data: jsonObject});
});

/* GET heatmap page. */
router.get('/home/heatmap', function(req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents').limit(100);



    var bucket = cluster.openBucket('sync_gateway', function(err) {
        var jsonObjectOld = [["1990", [35, 27, 0.001, -17, 146, 0.004, -31, -54, 0.003, 3, 10, 0.020, 39, 103, 0.002]], ["2000", [, 18, 122, 0.015, -14, -45, 0.001, -3, 14, 0.001, -7, -49, 0.003, 30, 87, 0.000, -27, 28, 0.122, 42, 143, 0.006, 60, 22, 0.002, 32, 108, 0.051, -17, -40, 0.005, 31, -113, 0.001, 28, 39, 0.001, -30, -67, 0.002]]]

        if (err) {
            // Failed to make a connection to the Couchbase cluster.
            var jsonObject = [ ["1990",{lat:35, lng:27,count: 10}, {lat:-17,lng:146,count:0.004},{lat:-31,lng:-54,count:0.003},{lat:3,lng:10,count:0.020},{lat:39,lng:103,count:0.002}],["2000",{lat:18,lng:122,count:0.015},{lat:-14,lng:-45,count:0.001},{lat:-3,lng:14,count:0.001},{lat:-7,lng:-49,count:0.003},{lat:30,lng:87,count:0.000},{lat:-27,lng:28,count:0.122},{lat:42,lng:143,count:0.006},{lat:60,lng:22,count:0.002},{lat:32,lng:108,count:0.051},{lat:-17,lng:-40,count:0.005},{lat:31,lng:-113,count:0.001},{lat:28,lng:39,count:0.001},{lat:-30,lng:-67,count:0.002}]]

            jsonObject = JSON.stringify(jsonObject);
            res.render('heatmap', { title: 'Heatmap of data',
                data: jsonObject});
        } else {
            bucket.query(query, function(err, results) {
                if(err) {
                    throw err;
                }

                //var jsonObject = [["CO", []],["SO2", []]];

                var jsonObject = {};
                var gasesMap = {};
                var count = 0;

                for (var i = 0; i < results.length; i++) {

                    var singleValue = results[i].value;
                    var gases = singleValue.gases;

                    for (var j=0;j<gases.length;j++) {
                        if(jsonObject[gases[j]]==undefined){
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
                res.render('contributions', { title: 'Contributions',
                    data: jsonObject});
            });
        }
    });
});

module.exports = router;
