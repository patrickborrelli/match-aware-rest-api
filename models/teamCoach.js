var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Team = require('./team.js');
var User = require('./user.js');

var TeamCoach = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    coach: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TeamCoach', TeamCoach);