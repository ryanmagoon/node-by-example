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

window.onload = function () {

    body = document.querySelector('body');

    userModel = new UserModel();

    userModel.fetch(function (error, result) {
        Router
            .add('find-friends', function() {
                if(userModel.isLogged()) {
                    var p = new FindFriends();
                    showPage(p);
                } else {
                    Router.navigate('login');
                }
            })
            .add('profile', function() {
                if(userModel.isLogged()) {
                    var p = new Profile();
                    showPage(p);
                } else {
                    Router.navigate('login');
                }
            })
            .add('login', function () {
                var p = new Login();
                showPage(p);
            })
            .add('register', function () {
                var p = new Register();
                showPage(p);
            })
            .add('home', function () {
                var p = new Home();
                showPage(p);
            })
            .add(function () {
                Router.navigate('home');
            })
            .listen()
            .check();
    });
};