var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var League = require('./league.js');
var Team = require('./team.js');
var User = require('./user.js');

var LeagueTeam = new Schema({
    league: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    team: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    added_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeagueTeam', LeagueTeam);