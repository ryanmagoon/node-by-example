var ObjectId = require('mongodb').ObjectId;
var helpers = require('./helpers');
var getDatabaseConnection = helpers.getDatabaseConnection;
var response = helpers.response;
var error = helpers.error;
var getCurrentUser = helpers.getCurrentUser;
var fs = require('fs');

module.exports = function(req, res) {
    var user;
    if(req.session && req.session.user) {
        user = req.session.user;
        switch(req.method) {
        case 'POST':
            var formidable = require('formidable');
            var uploadDir = __dirname + '/../static/uploads/';
            var form = new formidable.IncomingForm();
            form.multiples = true;
            
            form.parse(req, function(err, formData, files) {
                var data = {
                    text: formData.text
                };
                if(formData.pageId) {
                    data.pageId = formData.pageId;
                }
                if(!data.text || data.text === '') {
                    error('Please add some text.', res);
                } else {
                    var processFiles = function(userId, callback) {
                        if(files.files) {
                            var fileName = userId + '_' + files.files.name;
                            var filePath = uploadDir + fileName;
                            fs.rename(files.files.path, filePath, function(err) {
                                if(err) throw err;
                                callback(fileName);
                            });
                        } else {
                            callback();
                        }
                    };
                    var done = function() {
                        response({
                            success: 'OK'
                        }, res);
                    };
                    getDatabaseConnection(function(db) {
                        getCurrentUser(function(user) {
                            var collection = db.collection('content');
                            data.userId = user._id.toString();
                            data.userName = user.firstName + ' ' + user.lastName;
                            data.date = new Date();
                            processFiles(user._id, function(file) {
                                if(file) {
                                    data.file = file;
                                }
                                collection.insert(data, done);
                            });
                        }, req, res);
                    });
                }
            });
            break;
        case 'GET':
            getCurrentUser(function(user) {
                if(!user.friends) {
                    user.friends = [];
                }
                getDatabaseConnection(function(db) {
                    var collection = db.collection('content');
                    collection.find({
                        $query: {
                            // query for the current user's id as well as all of that user's friends.
                            userId: { $in: [user._id.toString()].concat(user.friends) }
                        },
                        $orderby: {
                            date: -1
                        }
                    }).toArray(function(err, result) {
                        result.forEach(function(value, index, arr) {
                            arr[index].id = ObjectId(value.id);
                            delete arr[index].userId;
                        });
                        response({
                            posts: result
                        }, res);
                    });
                });
            }, req, res);
            break;
        }
    } else {
        error('You must be logged in order to use this method.', res);
    }
};