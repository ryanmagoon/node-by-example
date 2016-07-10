module.exports = Ractive.extend({
    template: require('../../tpl/pages'),
    components: {
        navigation: require('../views/Navigation'),
        appfooter: require('../views/Footer')
    },
    data: {

    },
    onrender: function() {
        var model = new PagesModel();
        var self = this;
        this.on('create', function() {
            var formData = new FormData();
            formData.append('title', this.get('title'));
            formData.append('description', this.get('description'));
            model.create(formData, function(error, result) {
                if(error) {
                    self.set('error', error.error);
                } else {
                    self.set('title', '');
                    self.set('description', '');
                    self.set('error', false);
                    self.set('success', 'The page was created successfully.');
                }
            });
        });
        var getPages = function() {
            model.fetch(function(err, result) {
                if(!err) {
                    self.set('pages', result.pages);
                } else {
                    self.set('error', err.error);
                }
            });
        };
        getPages();
    }
});