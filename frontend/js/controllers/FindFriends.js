var Friends = require('../models/Friends');

module.exports = Ractive.extend({
    template: require('../../tpl/find-friends'),
    components: {
        navigation: require('../views/Navigation'),
        appfooter: require('../views/Footer')
    },
    data: {
        loading: false,
        message: '',
        searchFor: '',
        foundFriends: null
    },
    onrender: function() {
        // ...
    }
});