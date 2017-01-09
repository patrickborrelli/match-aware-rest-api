var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Forum = require('./forum.js');

/**
 * This model represents the many-to-many relationship between Users and Forums
 * wherein a User Subscribes to Forums, and a Forum has User Subscribers.
 */

var Subscription = new Schema({
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

module.exports = mongoose.model('Subscription', Subscription);