var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Forum = require('./forum.js');
var User = require('./user.js');

/**
 * This model represents the many-to-many relationship between Users and Forums
 * wherein a User Moderates a Forums, and a Forum has User Moderators.
 */

var Moderator = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    forumId: {
        type: Schema.Types.ObjectId,
        ref: 'Forum'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Moderator', Moderator);