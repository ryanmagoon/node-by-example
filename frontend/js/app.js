var Router = require('./lib/Router')();
var Home = require('./controllers/Home');
var Register = require('./controllers/Register');
var currentPage;
var body;

var showPage = function(newPage) {
    if(currentPage) { currentPage.teardown(); }
    currentPage = newPage;
    body.innerHTML = '';
    currentPage.render(body);
    currentPage.on('navigation.goto', function(e, route) {
        Router.navigate(route);
    });
};

window.onload = function() {

    body = document.querySelector('body');

    Router
    .add('register', function() {
        var p = new Register();
        showPage(p);
    })
    .add('home', function() {
        var p = new Home();
        showPage(p);
    })
    .add(function() {
        Router.navigate('home');
    })
    .listen()
    .check();
};