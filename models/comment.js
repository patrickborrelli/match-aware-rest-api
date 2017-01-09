var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Entry = require('./entry.js');
var Post = require('./post.js');

var Comment = new Schema({
    text:  {
        type: String,
        required: true
    },
    postedBy:  {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentCommentId: this,
    rootCommentId: this,
    ancestors: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    hasChildren: {
        type: Boolean,
        default: false
    },
    entryId: {
        type: Schema.Types.ObjectId,
        ref: 'Entry'
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    type: {
        type: String,
        enum: ['BLOG', 'FORUM', 'COMMENT'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', Comment);