var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Certification = new Schema({
    name: {
        required: true,
        type: String
    },
    long_name: String,
    issuing_body: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Certification', Certification);