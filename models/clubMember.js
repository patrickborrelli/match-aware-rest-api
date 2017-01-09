var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Club = require('./club.js');

var ClubMember = new Schema({
    club: {
        type: Schema.Types.ObjectId,
        ref: 'Club'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ClubMember', ClubMember);