var express = require('express');
var bodyParser = require('body-parser');
var ClubMember = require('../models/clubMember');
var Club = require('../models/club');
var User = require('../models/user');
var Verify = require('./verify');
var async = require('async');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all club members
.get(Verify.verifyOrdinaryUser, function(req, res) {
    ClubMember.find(req.query)
        .populate('club')
        .populate('user')
        .exec(function(err, clubMembers) {
            if(err) throw err;
            res.json(clubMembers);
    });
})

//POST add club members
.post(Verify.verifyOrdinaryUser, function(req, res) {
    ClubMember.create(req.body, function(err, clubMember) {
        if(err) return next(err);
        console.log("New clubMember added");
        res.json(clubMember);
    });
})
 
//DELETE all clubs members
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    ClubMember.find({}, function(err, clubMembers) {
        if(err) return next(err);
        console.log("Removing all club members from system.");
        console.log(clubMembers.length + " club members were found and are pending delete.");
        for(var i = clubMembers.length -1; i >= 0; i--) {
            clubMembers[i].remove();
        }
        res.json("Successfully removed all clubMembers.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findClubMembers/:clubId')

///GET all users who are members of this club
.get(Verify.verifyOrdinaryUser, function(req, res) {
    async.waterfall(
        [
            function(callback) {
                ClubMember.find({club: req.params.clubId})
                    .populate('club')
                    .populate('user')
                    .exec(function(err, members) {
                        if(err) return next(err);
                        console.log("Found " + members.length + " clubmembers.");
                        callback(null, members);
                    });
                
            },
            function(clubMembers, callback) {
                User.find({"_id": { "$in": clubMembers.map(function(cm) {
                        return cm.user._id })
                    }
                }, function(err, users) {
                    if(err) return next(err);
                    res.json(users);
                    callback(null, users);
                });
            }
        ],
        function(err, users) {
            if(err) return next(err);
            console.log("Found users : " + users);
        }
    )
});

//#################################################################################################
//#################################################################################################
router.route('/findClubMemberships/:userId')

///GET all clubs the user belongs to
.get(Verify.verifyOrdinaryUser, function(req, res) {
    async.waterfall(
        [
            function(callback) {
                ClubMember.find({user: req.params.userId})
                    .populate('club')
                    .populate('user')
                    .exec(function(err, memberships) {
                        if(err) return next(err);
                        console.log("Found " + memberships.length + " memberships.");
                        callback(null, memberships);
                    });
                
            },
            function(memberships, callback) {
                Club.find({"_id": { "$in": memberships.map(function(cm) {
                        return cm.club._id })
                    }
                }, function(err, clubs) {
                    if(err) return next(err);
                    res.json(clubs);
                    callback(null, clubs);
                });
            }
        ],
        function(err, clubs) {
            if(err) return next(err);
            console.log("Found clubs : " + clubs);
        }
    )
});


module.exports = router;