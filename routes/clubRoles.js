var express = require('express');
var bodyParser = require('body-parser');
var ClubRole = require('../models/clubRole');
var async = require('async');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all club roles
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    ClubRole.find(req.query)
        .populate('club')
        .populate('role')
        .populate('member')
        .exec(function(err, roles) {
            if(err) throw err;
            res.json(roles);
    });
})

//POST add club role
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    console.log("Decoded id = " + req.decoded._id);
    req.body.added_by = req.decoded._id;
    console.log("Retrieved req.body.created_by: " + req.body.added_by);
    ClubRole.create(req.body, function(err, role) {
        if(err) return next(err);
        console.log("New role created");
        res.json(role);
    });
})

//DELETE all club roles
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    ClubRole.find({}, function(err, roles) {
        if(err) return next(err);
        console.log("Removing all club roles from system.");
        console.log(roles.length + " club roles were found and are pending delete.");
        for(var i = roles.length -1; i >= 0; i--) {
            roles[i].remove();
        }
        res.json("Successfully removed all club roles.");        
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findClubRole/:clubId/:roleId')

//GET find all users taking the specified role for this club:
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    //first retreive all club roles, then return an array of users:
     async.waterfall(
        [
            function(callback) {                
                ClubRole.find({club: req.params.clubId, role: req.params.roleId})
                    .populate('club')
                    .populate('role')
                    .populate('member')
                    .exec(function(err, roles) {
                        if(err) throw err;
                        callback(null, roles);
                });
            },
            function(roles, callback) {
                console.log("Received " + roles.length + " club roles.");
                console.log(roles);
                var users = [];
                
                if(roles.length == 0) {
                    callback(null, roles);
                } else {
                    //if there are roles found, add all to an array of users:
                    for(var i = 0; i < roles.length; i++) {
                        users.push(roles[i].member);
                    }                    
                    callback(null, users);
                }
            }
        ],
        function(err, users) {
            if(err) return next(err);
            res.json(users);
        }
    )    
});

//#################################################################################################
//#################################################################################################
router.route('/findClubMemberships/:userId')

//GET find all clubs the specified user belongs to:
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    //first retreive all club roles, then return an array of clubs:
     async.waterfall(
        [
            function(callback) {                
                ClubRole.find({member: req.params.userId})
                    .populate('club')
                    .populate('role')
                    .populate('member')
                    .exec(function(err, roles) {
                        if(err) throw err;
                        callback(null, roles);
                });
            },
            function(roles, callback) {
                console.log("Received " + roles.length + " club roles.");
                console.log(roles);
                var clubs = [];
                
                if(roles.length == 0) {
                    callback(null, roles);
                } else {
                    //if there are roles found, add all to an array of clubs:
                    for(var i = 0; i < roles.length; i++) {
                        clubs.push(roles[i].club);
                    }
                    callback(null, clubs);
                }
            }
        ],
        function(err, clubs) {
            if(err) return next(err);
            res.json(clubs);
        }
    )    
});


module.exports = router;