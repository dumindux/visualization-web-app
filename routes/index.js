var express = require('express');
var couchbase = require('couchbase');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var cluster = new couchbase.Cluster('192.248.8.247:8091');
  var ViewQuery = couchbase.ViewQuery;
  var query = ViewQuery.from('dev_all_documents', 'all_documents');

  var bucket = cluster.openBucket('sync_gateway', function(err) {
    if (err) {
	  // Failed to make a connection to the Couchbase cluster.
	  throw err;
    }
	 
    bucket.query(query, function(err, results) {
      if(err) {
        throw err;
      }
      var jsonObject = [["all_data", []]];
      for (var i = 0; i < results.length; i++) {
        var singleValue = results[i].value;
        jsonObject[0][1].push(singleValue.lat);
        jsonObject[0][1].push(singleValue.lon);
        jsonObject[0][1].push(parseInt(singleValue.CO));
      }
      jsonObject = JSON.stringify(jsonObject);
      res.render('index', { title: 'Visualizations',
                            data: jsonObject});
    });
  });
});

module.exports = router;
