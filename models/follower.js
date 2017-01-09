var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Blog = require('./blog.js');

/**
 * This model represents the many-to-many relationship between Users and Blogs
 * wherein a User Follows Blogs, and a Blog has User Followers.
 */

var Follower = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Follower', Follower);