var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var Verify = require('./verify.js');
var postRouter = express.Router();

postRouter.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
postRouter.route('/')

//retirieve all forum posts:  [ALL USERS]
.get(function(req, res, next) {
    Post.find({})
        .populate({
            path: 'forumId',
            model: 'Forum',
            populate: {
                path: 'moderators',
                model: 'User'
            }
        })
        .populate('createdBy')
        .exec(function(err, posts){
            if(err) return next(err);
            res.json(posts);
        });
});

//#################################################################################################
//#################################################################################################
postRouter.route('/:postId')

//retrieve forum post by id:  [ALL USERS]
.get(function(req, res, next) {
    Post.findById(req.params.postId)
        .populate({
            path: 'forumId',
            model: 'Forum',
            populate: {
                path: 'moderators',
                model: 'User'
            }
        })
        .populate('createdBy')
        .exec(function(err, post) {
            if(err) return next(err);
            res.json(post);
        });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyPostOwner, function(req, res, next) {
    Post.findByIdAndUpdate(req.params.postId, {$set: req.body}, {new: true})
        .populate({
            path: 'forumId',
            model: 'Forum',
            populate: {
                path: 'moderators',
                model: 'User'
            }
        })
        .populate('createdBy')
        .exec(function(err, post) {
            if(err) return next(err);
            res.json(post);
        });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyPostOwnerOrAdmin, function(req, res, next) {
    Post.findById(req.params.postId, function(err, post) {
        if(err) return next(err);
        
        //remove any comments for this post:
        Comment.find({"postId": req.params.postId}, function(err, comments) {
            console.log(comments);
            var mySize = comments.length;
            console.log("Post has " + mySize + " comments.");
            for(var i = 0; i < mySize; i++) {
                console.log("Removing comment with ID: " + comments[i]._id);
                comments[i].remove();
            }
        });
        
        post.remove();
        res.json("Post successfully removed.");
    });
});


//#################################################################################################
//#################################################################################################
postRouter.route('/:postId/comments')

//retrieve comments by post id:  [ANY USER]
.get(function(req, res, next) {
    Comment.find({"postId": req.params.postId})
        .populate({
            path:'postId',
            model: 'Post',
            populate: {
                path: 'forumId',
                model: 'Forum'
            }
        })
        .populate({
            path:'postId',
            model: 'Post',
            populate: {
                path: 'createdBy',
                model: 'User'
            }
        })
        .populate('postedBy')
        .populate('parentCommentId')
        .exec(function(err, comments) {
            if(err) return next(err);
            res.json(comments);
        });
})

//add a comment to this post:  [AUTH USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.postedBy = req.decoded._id;
    req.body.postId = req.params.postId;
    req.body.type = 'FORUM';
    Comment.create(req.body, function(err, comment) {
            if(err) return next(err);
            res.json(comment);
        });
})

//delete all comments for this forum post id:  [ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
   Comment.remove({"postId": req.params.postId}, function(err, result) {
       res.json("Removed all comments with entry id: " + req.params.postId);
   }); 
});

module.exports = postRouter;
