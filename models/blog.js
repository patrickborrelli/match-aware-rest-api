var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');
var Entry = require('./entry.js');
var Follower = require('./follower.js');

var Blog = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    headerImageUrl: String,
    description:  {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

/**
    this works here but not elsewhere in the API.  Have feelers out in the mongoose community to try 
    to find out why, for the meantime will utilize this here.
*/
Blog.pre('remove', function(next) {
    Entry.find({"blogId": this._id})
        .exec(function(err, entries) {
            console.log("found entries " + entries);
            for(var i = entries.length -1; i >= 0; i--) {
                entries[i].remove();
            }
        });
    Follower.remove({"blogId": this._id}).exec();
    next();
});

module.exports = mongoose.model('Blog', Blog);
