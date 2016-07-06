var MongoClient = require('mongodb').MongoClient;
var database;
var getDatabaseConnection = function(callback) {
    if(database) {
        return;
    } else {
        MongoClient.connect('mongodb://127.0.0.1:27017/nodejs-by-example', function(err, db) {
            if(err) {
                throw err;
            }
            database = db;
            callback(database);
        });
    }
};

var response = function(result, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result) + '\n');
};
var Router = require('../frontend/js/lib/router')();
Router
.add('api/version', function(req, res) {
    response({
        version: '0.1'
    }, res);
})
.add(function(req, res) {
    response({
        success: true
    }, res);
});

module.exports = function(req, res) {
    Router.check(req.url, [req, res]);
};