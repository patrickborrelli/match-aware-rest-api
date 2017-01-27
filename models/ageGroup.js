var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AgeGroup = new Schema({
    birth_year: {
        required: true,
        type: String,
        trim: true
    },
    soccer_year: {
        required: true,
        type: String,
        trim: true
    },
    name: {
        required: true,
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AgeGroup', AgeGroup);