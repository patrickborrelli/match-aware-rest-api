var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var LeagueType = new Schema({
    name: {
        required: true,
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeagueType', LeagueType);