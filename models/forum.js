var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Forum = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String
}, {
    timestamps: true
});

/**
This should work, and does work elsewhere...have support feelers out in the mongoose community
Forum.pre('remove', function(next) {
    console.log("User: " + User);
    console.log("Post: " + Post);
    console.log("Subscription: " + Subscription);
    Post.find({"blogId": this._id})
        .exec(function(err, posts) {
            console.log("found posts " + posts);
            for(var i = posts.length -1; i >= 0; i--) {
                posts[i].remove();
            }
        });
    Subscription.remove({"forumId": this._id}).exec();
    next();
});
*/

module.exports = mongoose.model('Forum', Forum);