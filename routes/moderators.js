var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('../models/user');
var Forum = require('../models/forum');
var Moderator = require('../models/moderator');
var Verify = require('./verify');

var moderatorRouter = express.Router();
moderatorRouter.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
moderatorRouter.route('/')

//retrieve all moderators from the system:  [ADMIN]
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Moderator.find({}) 
        .populate({
            path: 'userId',
            type: 'User'
        })     
        .populate({
            path: 'forumId',
            type: 'Forum'
        })
        .exec(function(err, moderators) {
            if(err) return next(err);
            res.json(moderators);
        });
})

//remove all moderators from the system:  [ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Moderator.remove({}, function(err, moderators) {
        if(err) return next(err);
        console.log("Removed: \n" + moderators);
        res.json("All moderators removed.");
    });
}); 

//#################################################################################################
//#################################################################################################
moderatorRouter.route('/:forumId/:userId')

//add user as moderator to forum:   [ADMIN]
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    //set up req body, then confirm this user is not already a moderator for this forum:
    req.body.forumId = req.params.forumId;
    req.body.userId = req.params.userId;
    Moderator.findOne({"forumId": req.body.forumId, "userId": req.body.userId}, function(err, oldModerator) {
        if(err) return next(err);
        if(oldModerator == null) {
            Moderator.create(req.body, function(err, newModerator) {
                if(err) return next(err);
                res.json(newModerator);                
            });
        } else {
            res.json(oldModerator);
        }
    });
})

//remove user as moderator for forum:  [ADMIN]
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Moderator.findOne({"forumId": req.params.forumId, "userId": req.params.userId}, function(err, moderator) {
        if(err) return next(err);
        if(moderator != null) {
            moderator.remove();
            res.json("Successfully removed moderator.");
        } else {
            res.json("No moderator found to remove.");
        }        
    });
});




module.exports = moderatorRouter;