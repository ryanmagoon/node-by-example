var ObjectId = require('mongodb').ObjectId;
var helpers = require('./helpers');
var response = helpers.response;
var error = helpers.error;
var getDatabaseConnection = helpers.getDatabaseConnection;
var getCurrentUser = helpers.getCurrentUser;

module.exports = function(req, res, params) {
    var user;
    if(req.session && req.session.user) {
        user = req.session.user;
    } else {
        error('You must be logged in in order to user this method.', res);
        return;
    }
    switch(req.method) {
    case 'GET':
        getDatabaseConnection(function(db) {
            var collection = db.collection('pages');
            var query;
            if(params && params.id) {
                query = { _id: ObjectId(params.id) };
            } else {
                query = {};
            }
            collection.find({
                $query: query,
                $orderby: {
                    date: -1
                }
            }).toArray(function(err, result) {
                result.forEach(function(value, index, arr) {
                    arr[index].id = value._id;
                    delete arr[index].userId;
                });
                response({
                    pages: result
                }, res);
            });
        });
        break;
    case 'POST':
        var formidable = require('formidable');
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, formData, files) {
            var data = {
                title: formData.title,
                description: formData.description
            };
            if(!data.title || data.title === '') {
                error('Please add some title.', res);
            } else if(!data.description || data.description === '') {
                error('Please add some description.', res);
            } else {
                var done = function() {
                    response({
                        success: 'OK'
                    }, res);
                };
                getDatabaseConnection(function(db) {
                    getCurrentUser(function(user) {
                        var collection = db.collection('pages');
                        data.userId = user._id.toString();
                        data.userName = user.firstName + ' ' + user.lastName;
                        data.date = new Date();
                        collection.insert(data, done);
                    }, req, res);
                });
            }
        });
        break;
    }
};