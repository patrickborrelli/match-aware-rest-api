var express = require('express');
var bodyParser = require('body-parser');
var UserInvite = require('../models/userInvite');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all user invites:
.get(function(req, res) {
    UserInvite.find({})
        .populate('role')
        .exec(function(err, userInvites) {
            if(err) throw err;
            res.json(userInvites);
    });    
})

//add a new user invite to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    UserInvite.create(req.body, function(err, userInvite) {
        if(err) return next(err);
        console.log("New user invite created");
        res.json(userInvite);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    UserInvite.remove({}, function(err, userInvites) {
        if(err) return next(err);
        console.log("Removed: \n" + userInvites);
        res.json("All user invites removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:userInviteId')

///GET user invite by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    UserInvite.findById(req.params.userInviteId)
        .populate('role')
        .exec(function(err, userInvite) {
            if(err) throw err;
            res.json(userInvite);
    });
})

//PUT update user invite by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    UserInvite.findByIdAndUpdate(req.params.userInviteId, {$set: req.body}, {new: true}) 
        .exec(function(err, userInvite) {
            if(err) throw err;
            res.json(userInvite);
    });
})

///DELETE user invite by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    UserInvite.findById(req.params.userInviteId)
        .exec(function(err, userInvite) {
            if(err) throw err;
            userInvite.remove();
            res.json("Successfully removed user invite " + userInvite.invite_key);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findByKey/:inviteKey')

///GET user invite by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    UserInvite.find({invite_key: req.params.inviteKey})
        .populate('role')
        .exec(function(err, userInvite) {
            if(err) throw err;
            res.json(userInvite);
    });
});

module.exports = router;