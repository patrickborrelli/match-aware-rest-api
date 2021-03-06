var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Team = require('./team.js');
var Role = require('./role.js');
var User = require('./user.js');

var TeamMember = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    member: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    }
}, {
    timestamps: true
});

TeamMember.plugin(deepPopulate);
module.exports = mongoose.model('TeamMember', TeamMember);