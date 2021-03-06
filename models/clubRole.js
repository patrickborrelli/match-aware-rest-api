var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Club = require('./club.js');
var Role = require('./role.js');
var User = require('./user.js');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var ClubRole = new Schema({
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
    member: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    added_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

ClubRole.plugin(deepPopulate);
module.exports = mongoose.model('ClubRole', ClubRole);