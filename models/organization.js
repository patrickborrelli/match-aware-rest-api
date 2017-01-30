var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Club = require('./club.js');

var Organization = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    },
    short_name: {
        required: true,
        type: String,
        trim: true
    },
    administrator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    club_affiliation: [{
        type: Schema.Types.ObjectId,
        ref: 'Club'
    }],
    staff: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Organization', Organization);