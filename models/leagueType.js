var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var LeagueType = new Schema({
    name: {
        required: true,
        type: String
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeagueType', LeagueType);