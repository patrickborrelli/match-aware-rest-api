var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AgeGroup = new Schema({
    birth_year: {
        required: true,
        type: String
    },
    soccer_year: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AgeGroup', AgeGroup);