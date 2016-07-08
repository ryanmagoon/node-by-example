var ajax = require('../lib/Ajax');
var Base = require('./Base');

module.exports = Base.extend({
    data: {
        url: '/api/content'
    },
    create: function(content, callback) {
        var self = this;
        ajax.request({
            url: this.get('url'),
            method: 'POST',
            data: {
                text: content.text
            },
            json: true
        })
        .done(function(result) {
            callback(null, result);
        })
        .fail(function(xhr) {
            callback(JSON.parse(xhr.responseText));
        });
    }
});