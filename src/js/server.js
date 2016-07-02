var http = require('http');
var fs = require('fs');
var view = {
    render: function() {
        var html = ' ';
        html += '<!DOCTYPE html>';
        html += '<html>';
        html += '<head><title>Node.js byexample</title></head>';
        html += '<body>';
        html += '<h1>Status ' + (model.status ? 'on' : 'off') + '</h1>';
        html += '<a href="/on">switch on</a><br />';
        html += '<a href="/off">switch off</a>';
        html += '</body>';
        html += '</html>';
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html + '\n');
    }
};
http.createServer(function(req, res){
    var content = '';
    var type = '';
    if (req.url === '/') {
        content = fs.readFileSync('./page.html');
        type = 'text/html';
    } else if (req.url === '/styles.css') {
        content = fs.readFileSync('./styles.css');
        type = 'text/css';
    } else if (req.url === '/api/user/new') {
        // Do actions like
        // reading POST parameters
        // storing the user into the database
        content = '{"success": true}';
        type = 'application/json';
    }
    res.writeHead(200, {'Content-Type': type});
    res.end(content + '\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

