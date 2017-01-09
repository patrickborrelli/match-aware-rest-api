var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Blog = require('../models/blog');
var Entry = require('../models/entry');
var User = require('../models/user');
var Verify = require('./verify');
var Follower = require('../models/follower');
var blogRouter = express.Router();

blogRouter.use(bodyParser.json());


//#################################################################################################
//#################################################################################################
blogRouter.route('/')

//retrieve all blogs from the system:  [ALL USER]
.get(function(req, res, next) {
    Blog.find(req.query) 
        .populate('author')     
        .exec(function(err, blog) {
            if(err) return next(err);
            console.log("Retrieved blog: " + blog);
            res.json(blog);
        });
})

//add a new blog to the system:   [AUTHENTICATED USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.author = req.decoded._id;
    Blog.create(req.body, function(err, blog) {
        if(err) return next(err);
        console.log("New blog created");
        res.json(blog);
    });
})

//delete all blogs in the system:    [ADMIN USER]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Blog.find({}, function(err, blogs) {
        if(err) return next(err);
        for(var i = blogs.length -1; i >= 0; i--) {
            blogs[i].remove();
        }
        res.json(blogs);        
    });
});
    

//#################################################################################################
//#################################################################################################
blogRouter.route('/:blogId')

//retrieve a specific blog by blog id:    [ALL USER]
.get(function(req, res, next) {
    Blog.findById(req.params.blogId)
        .populate('author')
        .exec(function (err, blog) {
            if (err) return next(err);
            res.json(blog);
        });
})

//update a specific blog by blog id:     [OWNER]
.put(Verify.verifyOrdinaryUser, Verify.verifyBlogOwner, function(req, res, next) {
    Blog.findByIdAndUpdate(req.params.blogId, {$set: req.body}, {new: true}, function(err, blog) {
        if(err) throw err;
        res.json(blog);
    });
})

//delete a specific blog by blog id:    [OWNER OR ADMIN USER]
.delete(Verify.verifyOrdinaryUser, Verify.verifyBlogOwnerOrAdmin, function(req, res, next) {
    Blog.findById(req.params.blogId, function(err, blog) {
        if(err) return next(err);
        blog.remove();
        res.json(blog);
    });
});
    

//#################################################################################################
//#################################################################################################
blogRouter.route('/:blogId/entries')

//retrieve all blog entries for the specified blog by id:   [ALL USER]
.get(function (req, res, next) {
    Entry.find({"blogId": req.params.blogId})
        .populate({
            path: 'blogId',
            model: 'Blog',
            populate: {
                path: 'author',
                model: 'User'
            }
        })
        .exec(function(err, blogs) {
            if (err) return next(err);
            res.json(blogs);
        });
})

//add a blog entry to the specified blog by id:   [OWNER]
.post(Verify.verifyOrdinaryUser, Verify.verifyBlogOwner, function (req, res, next) {
    req.body.blogId = req.params.blogId;
    Entry.create(req.body, function (err, entry) {
        if (err) return next(err);
        console.log('created blog entry with id:' + entry._id);
        res.json(entry);
    });
});

//#################################################################################################
//#################################################################################################
blogRouter.route('/:blogId/follow')

//follow this blog:  [AUTHENTICATED USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    User.findById(req.decoded._id, function(err, user) {
        if(err) return next(err);
        console.log("Retrieved user email is : " + user.emailAddress);
        if(user.emailAddress == null || user.emailAddress == "") {
            console.log("User does not have and email address on file, unable to follow this blog.");
            res.json("Add an email address to your account before attempting to follow a blog.");
        } else {
            //otherwise:
            req.body.blogId = req.params.blogId;
            req.body.userId = user._id;
            Follower.findOne({"blogId": req.params.blogId, "userId": user._id}, function(err, follower) {
                if(err) return next(err);
                if(follower == null || follower == "") {
                    Follower.create(req.body, function(err, follower) {
                        if(err) return next(err);
                        console.log("Added user " + user.getFullName() + " as a follower of blog with id: " + req.params.blogId);
                        res.json(follower);
                    });
                } else {
                    res.json(follower);
                }
            });            
        }
    });
});


//#################################################################################################
//#################################################################################################
blogRouter.route('/:blogId/unfollow')

//follow this blog:  [AUTHENTICATED USER]
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Follower.findOne({"blogId": req.params.blogId, "userId": req.decoded._id}, function(err, follower) {
        if(err) return next(err);
        if(follower != null && follower != "") {
            follower.remove();
        }
        res.json("No longer following this blog.");
    });  
});

module.exports = blogRouter;