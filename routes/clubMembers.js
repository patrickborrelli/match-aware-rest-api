var express = require('express');
var bodyParser = require('body-parser');
var ClubMember = require('../models/clubMember');
var Club = require('../models/club');
var User = require('../models/user');
var Role = require('../models/role');
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
router.route('/findClubAdmin/:clubId')

///GET the administrative user for this club
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    async.waterfall(
        [
            function(callback) {
                ClubMember.find({club: req.params.clubId})
                    .populate('club')
                    .populate('user')
                    .exec(function(err, members) {
                        if(err) return next(err);
                        console.log("\n\nFound members: ");
                        console.log(members);
                        //build array of member IDs:
                        var myMembers = [];
                        for(var i = 0; i < members.length; i++) {
                            myMembers.push(members[i].user._id);
                        }
                        console.log("Passing on array of ids:");
                        console.log(myMembers);                    
                        callback(null, myMembers);
                    });                
            },
            function(members, callback) {
                Role.findOne({"name": "CLUB_ADMIN"})
                    .exec(function(err, role) {
                        if(err) return next(err);                    
                        console.log("\n\nFound role ID: ");
                        console.log(role);
                        callback(null, members, role._id);
                });
            },
            function(members, roleId, callback) {
                var adminUser = null;
                console.log("\n\nPassed in members: ");
                console.log(members);
                User.find({"_id": { "$in": members }}) 
                    .exec(function(err, users) {
                        if(err) return next(err);
                        for(var i = 0; i < users.length; i++) {
                            for(var j = 0; j < users[i].roles.length; j++) {
                                if(String(users[i].roles[j]) == String(roleId)) {
                                    adminUser = users[i];
                                }
                            }
                        }
                        callback(null, adminUser);
                    });
            }
        ],
        function(err, user) {
            if(err) return next(err);
            res.json(user);
        }
    )
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
                User.find({"_id": { "$in": clubMembers.map(function(cm) { return cm.user._id })}})
                    .populate('ceretifications')
                    .populate('licenses')
                    .populate('roles')
                    .exec(function(err, users) {
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