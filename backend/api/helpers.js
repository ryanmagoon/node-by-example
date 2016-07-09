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
    // ...
};

module.exports = {
    response: response,
    error: error,
    getDatabaseConnection: getDatabaseConnection,
    processPOSTRequest: processPOSTRequest,
    validEmail: validEmail,
    getCurrentUser: getCurrentUser
};