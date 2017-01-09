var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Blog = require('../models/blog');
var Comment = require('../models/comment');
var Entry = require('../models/entry');
var User = require('../models/user');
var Post = require('../models/post');
var Verify = require('./verify');
var entryRouter = express.Router();

entryRouter.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
entryRouter.route('/')

//retrieve all blog entries   [ANY USER]
.get(function(req, res, next) {
    Entry.find({})
        .populate({
            path: 'blogId',
            model: 'Blog',
            populate: {
                path: 'author',
                model: 'User'
            }
        })
        .exec(function(err, entries) {
            if(err) return next(err);
            res.json(entries);
            
        });
});

//#################################################################################################
//#################################################################################################
entryRouter.route('/:entryId')

//retrieve blog entry by entry id:  [ANY USER]
.get(function(req, res, next) {
    Entry.findById(req.params.entryId)
        .populate({
            path: 'blogId',
            model: 'Blog',
            populate: {
                path: 'author',
                model: 'User'
            }
        })
        .exec(function (err, entry) {
            if (err) return next(err);
            res.json(entry);
    });
})

//update blog entry by entry id:  [OWNER]
.put(Verify.verifyOrdinaryUser, Verify.verifyEntryOwner, function(req, res, next) {
    Entry.findByIdAndUpdate(req.params.entryId, {$set: req.body}, {new: true})
        .populate({
            path: 'blogId',
            model: 'Blog',
            populate: {
                path: 'author',
                model: 'User'
            }
        })
        .exec(function(err, entry) {
            if(err) throw err;
            res.json(entry);
        });
})

//delete blog entry by entry id: [OWNER or ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyEntryOwner, function(req, res, next) {
    Entry.findById(req.params.entryId, function(err, entry) {
        if(err) return next(err);
        
        //remove any comments for this entry:
        Comment.find({"entryId": req.params.entryId}, function(err, comments) {
            if(err) return next(err);
            console.log(comments);
            var mySize = comments.length;
            console.log("Entry has " + mySize + " comments.");
            //remove all children of each comment:
            for(var i = 0; i < mySize; i++) {
                Comment.find({"rootCommentId":comments[i]._id}, function(err, childComments) {
                    if(err) return next(err);
                    var childSize = childComments.length;
                    console.log("Entry has " + childSize + " children.");
                    for(var j = 0; j < childSize; j++) {
                        childComments[j].remove();
                    }
                });
                console.log("Removing comment with ID: " + comments[i]._id);
                comments[i].remove();
            }
        });
        
        entry.remove();
        res.json("Entry successfully removed.");
    });
});


//#################################################################################################
//#################################################################################################
entryRouter.route('/:entryId/comments')

//retrive all blog entry comments by entry id:  [ANY USER]
.get(function(req, res, next) {
    Comment.find({"entryId": req.params.entryId}) 
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
            res.json(comments);
    });
})

//add a comment to the specified blog entry:   [AUTH USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.postedBy = req.decoded._id;
    req.body.entryId = req.params.entryId;
    req.body.type = 'BLOG';
    Comment.create(req.body, function(err, comment) {
        if(err) return next(err);
        console.log("New comment created");
        res.json(comment);       
    });
})

//delete all comments for this entry by id:   [ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Comment.remove({"entryId": req.params.entryId}, function(err, done) {
        console.log('Removed all comments with entry id: ' + req.params.entryId);
        res.json(done);
    });     
});

module.exports = entryRouter;