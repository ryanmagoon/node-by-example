var MongoClient = require('mongodb').MongoClient;
var queryString = require('queryString');
var database;

var response = function(result, res) {
    // ...
};

var error = function(message, res) {
    // ...
};

var getDatabaseConnection = function(callback) {
    // ...
};

var processPOSTRequest = function(req, callback) {
    // ...
};

var validEmail = function(value) {
    // ...
};

var getCurrentUser = function(callback ,req, res) {
    getDatabaseConnection(function(db) {
        var collection = db.collection('users');
        collection.find({
            email: req.session.user.email
        }).toArray(function(err, result) {
            if(result.length === 0) {
                error('No such user', res);
            } else {
                callback(result[0]);
            }
        });
    });
};

module.exports = {
    response: response,
    error: error,
    getDatabaseConnection: getDatabaseConnection,
    processPOSTRequest: processPOSTRequest,
    validEmail: validEmail,
    getCurrentUser: getCurrentUser
};