var User = require('../models/user');
var jwt = require('jsonwebtoken'); //used to create, sign and verify tokens
var config = require('../config.js');
var Blog = require('../models/blog');
var Entry = require('../models/entry');
var Comment = require('../models/comment');
var Post = require('../models/post');

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyAdmin = function(req, res, next) {
    //check if verified ordinary user is an admin:
    var admin = req.decoded.admin;
    console.log("in verifyAdmin method");
    
    if(!admin) {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);        
    } else {
        return next();
    }
};

exports.verifyBlogOwnerOrAdmin = function(req, res, next) {
    //check if verified user is an admin:
    var admin = req.decoded.admin;
    console.log("Checking to confirm that user is either the owner of this blog or an admin.");
    Blog.findById(req.params.blogId, function (err, blog) {
            if (err) return next(err);
            var owner = blog.author;
            console.log("Found owner: " + owner);
            console.log("Found user: " + req.decoded._id);
            if(!admin && (owner != req.decoded._id)) {
                var err = new Error('You are not authorized to perform this operation.');
                err.status = 403;
                return next(err);
            } else {
                return next();
            }
    });        
};

exports.verifyBlogOwner = function(req, res, next) {
    console.log("Checking to confirm that user is the owner of this blog.");
    Blog.findById(req.params.blogId, function (err, blog) {
        if (err) return next(err);
        var owner = blog.author;
        console.log("Found owner: " + owner);
        console.log("Found user: " + req.decoded._id);
        if(owner != req.decoded._id) {
            var err = new Error('You are not authorized to perform this operation.');
            err.status = 403;
            return next(err);
        } else {
            return next();
        }
    });
};

exports.verifyCommentOwner = function(req, res, next) {
    console.log("Checking to confirm that the user is the owner of this comment.");
    Comment.findById(req.params.commentId, function(err, comment) {
        if(err) return next(err);
        var owner = comment.postedBy;
        console.log("Found owner: " + owner);
        console.log("Found user: " + req.decoded._id);
        if(owner != req.decoded._id) {
            var err = new Error("You are not authorized to perform this operation.");
            err.status = 403;
            return next(err);
        } else {
            return next();
        }
    });
};

exports.verifyCommentOwnerOrAdmin = function(req, res, next) {
    //check if verified user is an admin:
    var admin = req.decoded.admin;
    console.log("Checking to confirm that user is either the owner of this comment or an admin.");
    Comment.findById(req.params.commentId, function(err, comment) {
        if(err) return next(err);
        var owner = comment.postedBy;
        console.log("Found owner: " + owner);
        console.log("Found user: " + req.decoded._id);
        if(!admin && (owner != req.decoded._id)) {
            var err = new Error("You are not authorized to perform this operation.");
            err.status = 403;
            return next(err);
        } else {
            return next();
        }
    });       
};

exports.verifyEntryOwner = function(req, res, next) {
    console.log("Checking to confirm that user is the owner of this blog entry.");
    Entry.findById(req.params.entryId, function (err, entry) {
        if (err) return next(err);
        console.log("Found entry: " + entry);
        Blog.findById(entry.blogId, function(err, blog) {
            if(err) return next(err);
            var owner = blog.author;
            console.log("Found owner: " + owner);
            console.log("Found user: " + req.decoded._id);
            if(owner != req.decoded._id) {
                var err = new Error('You are not authorized to perform this operation.');
                err.status = 403;
                return next(err);
            } else {
                return next();
            }
        });        
    });
};

exports.verifyPostOwner = function(req, res, next) {
    console.log("Checking to confirm that user is the owner of this post.");
    Post.findById(req.params.postId, function(err, post) {
        if(err) return next(err);
        var owner = post.createdBy;
        console.log("Found owner: " + owner);
        console.log("Found user: " + req.decoded._id);
        if(owner != req.decoded._id) {
            var err = new Error('You are not authorized to preform this operation.');
            err.status = 403;
            return next(err);
        } else {
            return next();
        }
    });
};

exports.verifyPostOwnerOrAdmin = function(req, res, next) {
    //check if verified user is an admin:
    var admin = req.decoded.admin;
    console.log("Checking to confirm that user is the owner of this post.");
    Post.findById(req.params.postId, function(err, post) {
        if(err) return next(err);
        var owner = post.createdBy;
        console.log("Found owner: " + owner);
        console.log("Found user: " + req.decoded._id);
        if(!admin && (owner != req.decoded._id)) {
            var err = new Error('You are not authorized to preform this operation.');
            err.status = 403;
            return next(err);
        } else {
            return next();
        }
    });
};

exports.verifyOrdinaryUser = function(req, res, next) {
    //check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token ||req.headers['x-access-token'];
    
    //decode token
    if(token) {
        //verifies secret and checks exp
        jwt.verify(token, config.secretKey, function(err, decoded) {
            if(err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                //if everything is good, save to request for use in other routes:
                req.decoded = decoded;
                next();
            }
        });
    } else {
        //if there is no token return an error:
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};