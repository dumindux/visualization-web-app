var express = require('express');
var couchbase = require('couchbase');
var router = express.Router();

/* GET home page. */
router.get('/home/3dtimeline', function(req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents');



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
                res.render('index', { title: '3D Timeline',
                    data: jsonObject});
            });
        }
    });
});

router.get('/home', function(req, res, next) {
    res.sendfile('views/home.html');
});

router.get('/home/2ddotmap', function(req, res, next) {
    var cluster = new couchbase.Cluster('192.248.8.247:8091');
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('all_documents', 'all_documents');



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
                res.render('2ddots', { title: '2D Dots',
                    data: jsonObject});
            });
        }
    });
});


module.exports = router;
