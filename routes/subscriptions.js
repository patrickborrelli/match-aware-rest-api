var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/user');
var Forum = require('../models/forum');
var Subscription = require('../models/subscription');
var Verify = require('./verify.js');

var subscriptionRouter = express.Router();
subscriptionRouter.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
subscriptionRouter.route('/')

//retrieve all subscriptions  [ADMIN]
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Subscriptions.find({})
        .populate({
            path: 'forumId',
            model: 'Forum'
        })
        .populate({
            path: 'userId',
            model: 'User'
        }).exec(function(err, subscribers) {
            if(err) return next(err);
            res.json(subscribers);            
        });
});

//#################################################################################################
//#################################################################################################
subscriptionRouter.route('/users/:forumId')

//retrieve all users that subscribe to this forum  [moderator or ADMIN]
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    var userArray = [];
    Subscription.find({"forumId": req.params.forumId}, function(err, subscribers) {
        if(err) return next(err);
        
        if(subscribers.length > 0) {             
            for(var i = 0; i < subscribers.length; i++) {
               userArray.push(subscribers[i].userId);
            }
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
subscriptionRouter.route('/forums/:userId')

//retrieve all users that subscribe to this forum  [moderator or ADMIN]
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    var theUser = req.params.userId;
    var admin = req.decoded.admin;
    if(!admin && (theUser != req.decoded._id)) {
        var err = new Error('You are not authorized to perform this operation.');
        err.status = 403;
        return next(err);
    }    
    
    var forumArray = [];
    Subscription.find({"userId": req.params.userId}, function(err, subscribers) {
        if(err) return next(err);
        
        if(subscribers.length > 0) {             
            for(var i = 0; i < subscribers.length; i++) {
               forumArray.push(subscribers[i].forumId);
            }
            Forum.find({ "_id": { $in: forumArray } }, function(err, forums) {
                if(err) return next(err);
                res.json(forums);
            });
        } else {y
            var emptyArray = [];
            res.json(emptyArray);
        }
    });
});

module.exports = subscriptionRouter;


