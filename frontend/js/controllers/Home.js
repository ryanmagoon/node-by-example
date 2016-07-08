module.exports = Ractive.extend({
    template: require('../../tpl/home'),
    components: {
        navigation: require('../views/Navigation'),
        appfooter: require('../views/Footer')
    },
    data: {
        posting: true
    },
    onrender: function () {
        if (userModel.isLogged()) {
            var ContentModel = require('../models/Content');
            var model = new ContentModel();
            var self = this;

            this.on('post', function () {
                model.create({
                    text: this.get('text')
                }, function (error, result) {
                    self.set('text', '');
                    if (error) {
                        self.set('error', error.error);
                    } else {
                        self.set('error', false);
                        self.set('success', 'The post is saved successfully.<br />What about adding another one?');
                        getPosts();
                    }
                });
            });

            var getPosts = function() {
                model.fetch(function(err, result) {
                    if(!err) {
                        self.set('posts', result.posts);
                    }
                });
            };
            getPosts();
        } else {
            this.set('posting', false);
        }
    }
});