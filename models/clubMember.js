var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Club = require('./club.js');

var ClubMember = new Schema({
    club: {
        type: Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ClubMember', ClubMember);