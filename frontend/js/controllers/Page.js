module.exports = Ractive.extend({
    template: require('../../tpl/pages'),
    components: {
        navigation: require('../views/Navigation'),
        appfooter: require('../views/Footer')
    },
    data: {

    },
    onrender: {
        
    }
});