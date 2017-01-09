var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Comment = require('../models/comment');
var User = require('../models/user');
var Entry = require('../models/entry');
var Post = require('../models/post');
var Verify = require('./verify');
var commentRouter = express.Router();

commentRouter.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
commentRouter.route('/')

//retrieve all comments:   [ANY USER]
.get(function(req, res, next) {
    Comment.find(req.query) 
        .populate('postedBy')
        .populate({
            path:'entryId',
            model: 'Entry',
            populate: {
                path: 'blogId',
                model: 'Blog',
                populate: {
                    path: 'author',
                    model: 'User'
                }
            }
        })
        .populate({
            path:'postId',
            model: 'Post',
            populate: {
                path: 'forumId',
                model: 'Forum',
                populate: {
                    path: 'moderators',
                    model: 'User'
                }
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
        .populate('parentCommentId')
        .exec(function(err, comments) {
            if(err) return next(err);
            console.log("Retrieved all comments");
            res.json(comments);
        });
});


//#################################################################################################
//#################################################################################################
commentRouter.route('/:commentId')

//get a comment by comment id:  [ANY USER]
.get(function(req, res, next) {
    Comment.findById(req.params.commentId)
        .populate('postedBy')
        .populate({
            path:'entryId',
            model: 'Entry',
            populate: {
                path: 'blogId',
                model: 'Blog',
                populate: {
                    path: 'author',
                    model: 'User'
                }
            }
        })
        .populate({
            path:'postId',
            model: 'Post',
            populate: {
                path: 'forumId',
                model: 'Forum',
                populate: {
                    path: 'moderators',
                    model: 'User'
                }
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
        .populate('parentCommentId')
        .exec(function(err, comment) {
            if(err) return next(err);
            res.json(comment);
        });
})

//update a comment by id:  [OWNER]
.put(Verify.verifyOrdinaryUser, Verify.verifyCommentOwner, function(req, res, next) {
    Comment.findByIdAndUpdate(req.params.commentId, {$set: req.body}, {new: true})
        .populate('postedBy')
        .populate({
            path:'entryId',
            model: 'Entry',
            populate: {
                path: 'blogId',
                model: 'Blog',
                populate: {
                    path: 'author',
                    model: 'User'
                }
            }
        })
        .populate({
            path:'postId',
            model: 'Post',
            populate: {
                path: 'forumId',
                model: 'Forum',
                populate: {
                    path: 'moderators',
                    model: 'User'
                }
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
        .populate('parentCommentId')
        .exec(function(err, entry) {  
            if(err) throw err;
            res.json(entry);
        });
})

//delete a comment by id:  [OWNER OR ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyCommentOwnerOrAdmin, function(req, res, next) {
    console.log("Going to delete a comment");
    Comment.findById(req.params.commentId, function(err, theComment) {
        if(err) return next(err);
        //first delete all children of this comment:
        if(theComment.hasChildren) {
            Comment.find({ancestors: theComment._id}, function(err, children) {
                console.log("This comment has " + children.length + " child(ren).");
                for(var i = 0; i < children.length; i++) {
                    children[i].remove();
                }
            });
        }
        theComment.remove(function(err, resp) {
            if(err) return next(err);
            res.json(resp);
        });        
    });
});

//#################################################################################################
//#################################################################################################
commentRouter.route('/:commentId/comments')

//get all comments with this comment as a parent:  [ANY USER]
.get(function(req, res, next) {
    console.log("Retrieving all child comments for comment " + req.params.commentId);
    Comment.find({"parentCommentId": req.params.commentId})
        .populate('postedBy')
        .populate({
            path:'entryId',
            model: 'Entry',
            populate: {
                path: 'blogId',
                model: 'Blog',
                populate: {
                    path: 'author',
                    model: 'User'
                }
            }
        })
        .populate({
            path:'postId',
            model: 'Post',
            populate: {
                path: 'forumId',
                model: 'Forum',
                populate: {
                    path: 'moderators',
                    model: 'User'
                }
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
        .populate('parentCommentId')
        .populate('rootCommentId')
        .exec(function(err, comment) {
            if(err) return next(err);
            res.json(comment);
        });
})

//add a comment on this comment by comment id:  [AUTH USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    //get parent comment, if parent comment has no root comment id, set this 
    //root comment id to the parent, otherwise set this to the parent's 
    //root comment id, also set the parent hasChildren to true
    var parentPostId;
    var parentEntryId;
    Comment.findById(req.params.commentId, function(err, parentComment) {
        if(err) return next(err);
        var root = parentComment.rootCommentId;
        parentPostId = parentComment.postId;
        parentEntryId = parentComment.entryId;
        if(root == null || root == "") {
            console.log("Parent comment has no root set.");
            root = parentComment._id;            
        }
        //edit parent comment to set hasChild to true if it it false:
        if(!parentComment.hasChildren) {
            parentComment.hasChildren = true;
            parentComment.save(function(err, savedComment) {
                if(err) return next(err);
                console.log("Added data to parent comment and saved it successfully. \n " + savedComment);
            });
        }
        
        //create and save child comment:
        var ancestry = parentComment.ancestors.slice();
        console.log("Parent ancestors include: " + parentComment.ancestors);
        ancestry.push(parentComment._id);
        console.log("Child ancestors include: " + ancestry);
        req.body.rootCommentId = root;
        req.body.ancestors = ancestry;
        req.body.postId = parentPostId;
        req.body.entryId = parentEntryId;
        req.body.postedBy = req.decoded._id;                                                                                
        req.body.parentCommentId = req.params.commentId;
        req.body.type = 'COMMENT';
        Comment.create(req.body, function(err, comment) {
            if(err) return next(err);
            console.log("Created child comment " + comment);
            res.json(comment);
        });
    });    
});


module.exports = commentRouter;