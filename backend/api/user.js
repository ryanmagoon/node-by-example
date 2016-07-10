var helpers = require('./helpers');
var response = helpers.response;
var error = helpers.error;
var processPOSTRequest = helpers.processPOSTRequest;
var getDatabaseConnection = helpers.getDatabaseConnection;
var sha1 = helpers.sha1;
var validEmail = helpers.validEmail;


module.exports = function(req, res) {
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
    }
};