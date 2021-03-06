var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Club = require('./club.js');
var Role = require('./role.js');
var Team = require('./team.js');
var Message = require('./message.js');

var AccessRequest = new Schema({
    user: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    club: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Club'
    },
    role: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    approver: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED']
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('AccessRequest', AccessRequest);
