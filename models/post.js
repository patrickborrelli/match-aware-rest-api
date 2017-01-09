var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Forum = require('./forum.js');
var Comment = require('./comment.js');

var Post = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postText: {
        type: String,
        required: true
    },
    forumId: {
        type: Schema.Types.ObjectId,
        ref: 'Forum'
    },
}, {
    timestamps: true
});

/**
    This should work, and does work elsewhere...have support feelers out in the mongoose community
    
Post.pre('remove', function(next) {
    Comment.remove({"postId": this._id}).exec();
    next();
});
*/

module.exports = mongoose.model('Post', Post);