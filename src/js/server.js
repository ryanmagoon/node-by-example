var http = require('http');
var fs = require('fs');
var path = require('path');

var files = {};
var port = 9000;
var host = '127.0.0.1';

var sendError = function(message, code) {
    if(code === undefined) {
        code = 404;
    }
    res.writeHead(code, {'Content-Type': 'text/html'});
    res.end(message);
}

var assets = function(req, res) {
    // ...
};

var app = http.createServer(assets).listen(port, host);
console.log("Listening on " + host + ":" + port);