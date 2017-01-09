var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Forum = require('../models/forum');
var Post = require('../models/post');
var User = require('../models/user');
var Subscription = require('../models/subscription');
var Moderator = require('../models/moderator');
var Comment = require('../models/comment');
var Verify = require('./verify');
var forumRouter = express.Router();

forumRouter.use(bodyParser.json());
    

//#################################################################################################
//#################################################################################################
forumRouter.route('/')

//retrieve all forums from the system:  [ALL USERS]
.get(function(req, res, next) {
    Forum.find(req.query, function(err, forum) {
        if(err) return next(err);
        console.log("Retrieved forum: " + forum);
        res.json(forum);
    });
})

//add a new forum to the system:   [ADMIN USER]
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Forum.create(req.body, function(err, forum) {
        if(err) return next(err);
        console.log("New forum created");
        var id = forum._id;
        res.json(forum);
    });
})

//delete all forums in the system:    [ADMIN USER]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Forum.find({}, function(err, forums) {
        if(err) return next(err);
        console.log("Removing all forums from system.");
        console.log(forums.length + " forums were found and are pending delete.");
        for(var i = forums.length -1; i >= 0; i--) {
            var myForumTitle = forums[i].title;
            Post.find({"forumId": forums[i]._id}, function(err, posts) {
                if(err) return next(err);
                console.log("Removing " + posts.length + " posts from forum " + myForumTitle);
                for(var i = posts.length -1; i >= 0; i--) {
                    var myPostId = posts[i]._id;
                    Comment.remove({"postId": posts[i]._id}, function(err, result) {
                        console.log("Removed all comments with entry id: " + myPostId);
                    });
                    posts[i].remove();
                }
            });
            Subscription.remove({"forumId":forums[i]._id}, function(err, result) {
                if(err) return next(err);
                console.log("Removed all subscriptions to forum " + myForumTitle);
            });
            Moderator.remove({"forumId":forums[i]._id}, function(err, result) {
                if(err) return next(err);
                console.log("Removed all moderators for forum " + myForumTitle);
            });
            forums[i].remove();
        }
        res.json("Successfully removed all Forums.");        
    });
});

//#################################################################################################
//#################################################################################################
forumRouter.route('/:forumId')

//retrieve forum by id:   [ALL USERS]
.get(function(req, res, next) {
    Forum.findById(req.params.forumId, function(err, forum) {
        if(err) return next(err);
        console.log("Retrieved forum: " + forum);
        res.json(forum);
    });
})

//update forum by id:  [ADMIN]
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Forum.findByIdAndUpdate(req.params.forumId, {$set: req.body}, {new: true}, function(err, forum) {
        if(err) throw err;
        res.json(forum);
    });
})

//delete forum by id:  [ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Forum.findById(req.params.forumId, function(err, forum) {
        if(err) return next(err);
        var myForumTitle = forum.title;
        Post.find({"forumId": req.params.forumId}, function(err, posts) {
            if(err) return next(err);
            console.log("Removing all posts for forum " + forum.title);
            console.log(posts.length + " posts to remove.");
            for(var i = 0; i < posts.length; i++) {
                var myPostId = posts[i]._id;
                Comment.remove({"postId": myPostId}, function(err, result) {
                    console.log("Removed all comments with entry id: " + myPostId);
                });
                posts[i].remove();
            }
        });
        
        Subscription.remove({"forumId": req.params.forumId}, function(err, result) {
            if(err) return next(err);
            console.log("Removed all subscriptions to forum " + myForumTitle);
        });
        
        Moderator.remove({"forumId": req.params.forumId}, function(err, result) {
            if(err) return next(err);
            console.log("Removed all moderators for forum " + myForumTitle);
        });
        
        forum.remove();
        res.json(forum);
    });
});

//#################################################################################################
//#################################################################################################
forumRouter.route('/:forumId/posts')

//get all posts by forum id:  [ANY USER]
.get(function(req, res, next) {
    Post.find({"forumId": req.params.forumId})
        .populate({
            path: 'forumId',
            model: 'Forum'
        })
        .populate('createdBy')
        .exec(function(err, posts) {
            if(err) return next(err);
            res.json(posts);
        });
})

//add a forum post to the specified forum by id:   [AUTH USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.createdBy = req.decoded._id;
    req.body.forumId = req.params.forumId;
    Post.create(req.body, function (err, post) {
        if (err) return next(err);
        console.log('created post with id:' + post._id);
        res.json(post);
    });
});

//#################################################################################################
//#################################################################################################
forumRouter.route('/:forumId/subscribe')

//subscribe to this forum:  [AUTHENTICATED USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    User.findById(req.decoded._id, function(err, user) {
        if(err) return next(err);
        req.body.forumId = req.params.forumId;
        req.body.userId = user._id;
        Subscription.findOne({"forumId": req.params.forumId, "userId": user._id}, function(err, subscription) {
            if(err) return next(err);
            if(subscription == null || subscription == "") {
                Subscription.create(req.body, function(err, subscription) {
                    if(err) return next(err);
                    console.log("Added user " + user.getFullName() + " as a subscriber to forum with id: " + req.params.forumId);
                    res.json(subscription);
                });
            } else {
                res.json(subscription);
            }
        }); 
    });
});


//#################################################################################################
//#################################################################################################
forumRouter.route('/:forumId/unsubscribe')

//follow this blog:  [AUTHENTICATED USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Subscription.findOne({"forumId": req.params.forumId, "userId": req.decoded._id}, function(err, subscription) {
        if(err) return next(err);
        if(subscription != null && subscription != "") {
            subscription.remove();
        }
        res.json("No longer subscribed to this forum.");
    });  
});


module.exports = forumRouter;