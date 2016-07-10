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
.add(function(req, res) {
    response({
        success: true
    }, res);
});

module.exports = function(req, res) {
    Router.check(req.url, [req, res]);
};