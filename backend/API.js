var sha1 = require('sha1');
var MongoClient = require('mongodb').MongoClient;
var database;

var Router = require('../frontend/js/lib/router')();

Router
.add('api/version', require('./api/version'))
.add('api/user/login', require('./api/user-login'))
.add('api/user/logout', require('./api/user-logout'))
.add('api/user', require('./api/user'))
.add('api/friends/find', require('./api/friends-find'))
.add('api/friends/add', require('./api/friends-add'))
.add('api/friends', require('./api/friends'))
.add('api/content', require('./api/content'))
.add('api/pages/:id', require('./api/pages'))
.add('api/pages', require('./api/pages'))
.add(require('./api/default'));
module.exports = function(req, res) {
  Router.check(req.url, [req, res]);
}


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

var getCurrentUser = function(callback, req, res) {
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
}

var findFriends = function(db, searchFor, currentFriends) {
    var collection = db.collection('users'); // Grab the users collection
    var regExp = new RegExp(searchFor, 'gi'); // run the search globally, ignoring case
    var excludeEmails = [req.session.user.email]; // exclude the user's email
    currentFriends.forEach(function(value, index, arr) {
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
    }).toArray(function(err, result) {
        var foundFriends = [];
        for(var i=0; i<result.length; i++) {
            foundFriends.push({
                id: result[i]._id,
                firstName: result[i].firstName,
                lastName: result[i].lastName
            });
        };
        response({
            friends: foundFriends
        }, res);
    });
}

var querystring = require('querystring');
var processPOSTRequest = function(req, callback) {
    var body = '';
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function() {
        callback(querystring.parse(body));
    });
};

var validEmail = function (value) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@( (\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0- 9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
};

var response = function(result, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result) + '\n');
};

var processFiles = function(userId, callback) {
    if(files.files) {
        var fileName = userId + '_' + files.files.name;
        var filePath = uploadDir + fileName;
        fs.rename(files.files.path, filePath, function() {
            callback(fileName);
        });
    } else {
        callback();
    }
};

var Router = require('../frontend/js/lib/router')();
Router
.add('api/content', function(req, res) {
    var user;
    if(req.session && req.session.user) {
        user = req.session.user;
        switch(req.method) {
            case 'POST':
                var formidable = require('formidable');
                var uploadDir = __dirname + '/../static/uploads/';
                var form = new formidable.IncomingForm();
                form.multiples = true;
                
                form.parse(req, function(err, data, files) {
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
                        }
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

                // processPOSTRequest(req, function(data) {
                //     if(!data.text || data.text === '') {
                //         error('Please add some text.', res);
                //     } else {
                //         getDatabaseConnection(function(db) {
                //             getCurrentUser(function(user) {
                //                 var collection = db.collection('content');
                //                 data.userId = user._id.toString();
                //                 data.userName = user.firstName + ' ' + user.lastName;
                //                 data.date = new Date();
                //                 collection.insert(data, function(err, docs) {
                //                     response({
                //                         success: 'OK'
                //                     }, res);
                //                 });
                //             }, req, res);
                //         });
                //     }
                // });
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
        };
    } else {
        error('You must be logged in order to use this method.', res);
    }
})
.add('api/version', function(req, res) {
    response({
        version: '0.1'
    }, res);
})
.add('api/user/login', function(req, res) {
    processPOSTRequest(req, function(data) {
        if(!data.email || data.email === '' || !validEmail(data.email)) {
            error('Invalid or missing email.', res);
        } else if (!data.password || data.password === '') {
            error('Please enter your password.', res);
        } else { 
            getDatabaseConnection(function(db) {
                var collection = db.collection('users');
                collection.find({
                    email: data.email,
                    password: sha1(data.password)
                }).toArray(function(err, result) {
                    if(result.length === 0) {
                        error('Wrong email or password', res);
                    } else {
                        var user = result[0];
                        delete user._id;
                        delete user.password;
                        req.session.user = user;
                        response({
                            success: 'OK',
                            user: user
                        }, res);
                    }
                });
            });
        }
    });
})
.add('api/user', function(req,res) {
    switch(req.method) {
        case 'GET':
            if(req.session && req.session.user) {
                response(req.session.user, res);
            } else {
                response({}, res);
            }
        break;
        case 'PUT':
            processPOSTRequest(req, function(data) {
                if(!data.firstName || data.firstName === '') {
                    error('Please fill your first name.', res);
                } else if(!data.lastName || data.lastName === '') {
                    error('Please fill your last name.', res);
                } else {
                    getDatabaseConnection(function(db) {
                        var collection = db.collection('users');
                        if(data.password) {
                            data.password = sha1(data.password);
                        }
                        collection.update(
                            { email: req.session.user.email },
                            { $set: data },
                            function(err, result) {
                                if(err) {
                                    err('Error updating the data.');
                                } else {
                                    if(data.password) delete data.password;
                                    for (var key in data) {
                                        req.session.user[key] = data[key];
                                    }
                                    response({
                                        success: 'OK'
                                    }, res);
                                }
                            }
                        );
                    });
                }
            });
        break;
        case 'POST':
            processPOSTRequest(req, function(data) {
                if(!data.firstName || data.firstName === '') {
                    error('Please fill your first name.', res);
                } else if (!data.lastName || data.lastName === '') {
                    error('Please fill your last name.', res);
                } else if (!data.email || data.email === '' || !validEmail(data.email)) {
                    error('Invalid or missing email.', res);
                } else if (!data.password || data.password === '') {
                    error('Please fill your password.', res);
                } else {
                    getDatabaseConnection(function(db) {
                        var collection = db.collection('users');
                        data.password = sha1(data.password);
                        collection.insert(data, function(err, docs) {
                            response({
                                success: 'OK'
                            }, res);
                        });
                    });
                }
            });
        break;
        case 'DELETE':
            // ...
        break;
    };
})
.add(function(req, res) {
    response({
        success: true
    }, res);
});

module.exports = function(req, res) {
    Router.check(req.url, [req, res]);
};