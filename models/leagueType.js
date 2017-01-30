var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var LeagueType = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeagueType', LeagueType);