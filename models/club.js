var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Club = new Schema({
    name: {
        type: String,
        required: true
    },
    short_name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Club', Club);