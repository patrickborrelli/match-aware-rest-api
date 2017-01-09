var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var License = new Schema({
    name: {
        type: String,
        required: true
    },
    long_name: String,
    issuing_body: String
}, {
    timestamps: true
});

module.exports = mongoose.model('License', License);