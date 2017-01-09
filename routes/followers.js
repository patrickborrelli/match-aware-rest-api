var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/user');
var Follower = require('../models/follower');
var Blog = require('../models/blog');
var Verify = require('./verify');

var followerRouter = express.Router();

followerRouter.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
followerRouter.route('/')

//retrieve all followers  [ADMIN]
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Follower.find({})
        .populate({
            path: 'blogId',
            model: 'Blog'
        })
        .populate({
            path: 'userId',
            model: 'User'
        }).exec(function(err, followers) {
            if(err) return next(err);
            res.json(followers);            
        });
});

//#################################################################################################
//#################################################################################################
followerRouter.route('/users/:blogId')

//retrieve all users that follow this blog  [OWNER or ADMIN]
.get(Verify.verifyOrdinaryUser, Verify.verifyBlogOwnerOrAdmin, function(req, res, next) {
    var userArray = [];
    Follower.find({"blogId": req.params.blogId}, function(err, followers) {
        if(err) return next(err);
        
        if(followers.length > 0) {             
            for(var i = 0; i < followers.length; i++) {
               userArray.push(followers[i].userId);
            }
            console.log("User array contains: " + userArray);
            User.find({ "_id": { $in: userArray } }, function(err, users) {
                if(err) return next(err);
                res.json(users);
            });
        } else {
            var emptyArray = [];
            res.json(emptyArray);
        }
    });
});

//#################################################################################################
//#################################################################################################
followerRouter.route('/blogs/:userId')

//retrieve all blogs that this user follows      [AUTH USER or ADMIN]
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    var theUser = req.params.userId;
    var admin = req.decoded.admin;
    console.log("Found user to edit: " + theUser);
    console.log("Found current user: " + req.decoded._id);
    if(!admin && (theUser != req.decoded._id)) {
        var err = new Error('You are not authorized to perform this operation.');
        err.status = 403;
        return next(err);
    }    
    
    var blogArray = [];
    Follower.find({"userId": req.params.userId}, function(err, followers) {
        if(err) return next(err);
        
        if(followers.length > 0) {             
            for(var i = 0; i < followers.length; i++) {
               blogArray.push(followers[i].blogId);
            }
            console.log("Blog array contains: " + blogArray);
            Blog.find({ "_id": { $in: blogArray } }, function(err, blogs) {
                if(err) return next(err);
                res.json(blogs);
            });
        } else {
            var emptyArray = [];
            res.json(emptyArray);
        }
    });
});

module.exports = followerRouter;