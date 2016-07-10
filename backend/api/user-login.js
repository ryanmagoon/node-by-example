var helpers = require('./helpers');
var processPOSTRequest = helpers.processPOSTRequest;
var getDatabaseConnection = helpers.getDatabaseConnection;
var response = helpers.response;
var error = helpers.error;
var sha1 = helpers.sha1;
var validEmail = helpers.validEmail;

module.exports = function(req, res) {
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
};