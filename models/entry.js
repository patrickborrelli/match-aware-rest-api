var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Blog = require('./blog.js');
var Comment = require('./comment.js');

var Entry = new Schema({
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    },
    title: String,
    thumbnailUrl: String,
    content: String
}, {
    timestamps: true
});

Entry.pre('remove', function(next) {
    Comment.remove({"entryId": this._id}, function(err, theComments) {
        if(err) return next(err);
        console.log("Successfully removed all comments for this entry.")
    });
    next();
});

module.exports = mongoose.model('Entry', Entry);
