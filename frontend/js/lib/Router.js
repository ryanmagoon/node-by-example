module.exports = function() {
    return {
        routes: [],
        add: function(path, handler) {
            if(typeof path === 'function') {
                handler = path;
                path = '';
            }
            this.routes.push({
                path: path,
                handler: handler
            });
            return this;
        },
        check: function(fragment, params) {
            var fragment, vars;
            if(typeof f !== 'undefined') {
                fragment = f.replace(/^\//, '');
            } else {
                fragment = this.getFragment();
            }
            for(var i=0; i<this.routes.length; i++) {
                var match, path = this.routes[i].path;
                path = path.replace(/^\//, '');
                vars = path.match(/:[^\s/]+/g);

            }
        }
    }
};