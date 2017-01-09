var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Team = require('./team.js');
var User = require('./user.js');

var TeamPlayer = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TeamPlayer', TeamPlayer);