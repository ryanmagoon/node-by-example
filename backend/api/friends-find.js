var ObjectId = require('mongodb').ObjectId;
var helpers = require('./helpers');
var processPOSTRequest = helpers.processPOSTRequest;
var getDatabaseConnection = helpers.getDatabaseConnection;
var getCurrentUser = helpers.getCurrentUser;
var response = helpers.response;
var error = helpers.error;

var findFriends = function (db, searchFor, currentFriends) {
    var collection = db.collection('users'); // Grab the users collection
    var regExp = new RegExp(searchFor, 'gi'); // run the search globally, ignoring case
    var excludeEmails = [req.session.user.email]; // exclude the user's email
    currentFriends.forEach(function (value, index, arr) {
        arr[index] = ObjectId(value); // Converts from BSON to plain text
    });
    collection.find({
        $and: [
            {
                $or: [
                    { firstName: regExp },
                    { lastName: regExp }
                ]
            },
            { email: { $nin: excludeEmails } }, // Don't include the user
            { _id: { $nin: currentFriends } } // Don't include current friends
        ]
    }).toArray(function (err, result) {
        var foundFriends = [];
        for (var i = 0; i < result.length; i++) {
            foundFriends.push({
                id: result[i]._id,
                firstName: result[i].firstName,
                lastName: result[i].lastName
            });
        }
        response({
            friends: foundFriends
        }, res);
    });
};

module.exports = function (req, res) {
    if (req.session && req.session.user) {
        if (req.method === 'POST') {
            processPOSTRequest(req, function (data) {
                getDatabaseConnection(function (db) {
                    getCurrentUser(function (user) {
                        findFriends(db, data.searchFor, user.friends || []);
                    }, req, res);
                });
            });
        } else {
            error('This method accepts only POST requests.', res);
        }
    } else {
        error('You must be logged in to use this method.', res);
    }
};