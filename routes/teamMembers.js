var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var deepPopulate = require('mongoose-deep-populate');
var TeamMember = require('../models/teamMember');
var Team = require('../models/team');
var Role = require('../models/role');
var User = require('../models/user');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all team members:
.get(function(req, res, next) {
    TeamMember.find(req.query)
        .populate('team')
        .populate('member')
        .populate('role')
        .exec(function(err, teamMembers) {
            if(err) throw err;
            res.json(teamMembers);
    });    
})

//POST a new member to a team:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamMember.create(req.body, function(err, teamMember) {
        if(err) return next(err);
        console.log("New team member created");
        res.json(teamMember);
    });
})

//DELETE all team members from every team
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamMember.remove({}, function(err, teamMembers) {
        if(err) return next(err);
        console.log("Removed: \n" + teamMembers);
        res.json("All team members removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/removeAllMembers/:teamId')

///DELETE all members from team by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    var fullName;
    TeamMember.remove({team: req.params.teamId}, function(err, teamMembers) {
            if(err) throw err;
            console.log("Removed " + teamMembers);
            res.json("All team members removed.");
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:teamMemberId')

///GET team member by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamMember.findById(req.params.teamMemberId)
        .populate('team')
        .populate('member')
        .populate('role')
        .exec(function(err, member) {
            if(err) throw err;
            res.json(member);
    });
})

//PUT update team member by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamMember.findByIdAndUpdate(req.params.teamMemberId, {$set: req.body}, {new: true}) 
        .populate('team')
        .populate('member')
        .populate('role')
        .exec(function(err, member) {
            if(err) throw err;
            res.json(member);
    });
})

///DELETE team member by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamMember.findById(req.params.teamMemberId) 
        .populate('team')
        .populate('member')
        .populate('role')
        .exec(function(err, member) {
            if(err) throw err;
            var fullName = member.member.getFullName() + " - " + member.team.name + " - " + member.role.name;
            member.remove();
            res.json("Successfully removed " + fullName);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:userId/:teamId')

///DELETE team member from team by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    var fullName;
    TeamMember.findOne({member: req.params.userId, team: req.params.teamId})
        .populate('team')
        .populate('member')
        .populate('role')
        .exec(function(err, teamMember) {
            if(err) throw err;
            fullName = teamMember.member.getFullName() + " - " + teamMember.team.name;
            teamMember.remove();
            res.json("Successfully removed team member " + fullName);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findMembersTeams/:memberId')

//GET all teams this member is associated with:
.get(function(req, res, next) {
    async.waterfall(
        [
            function(callback) {
                TeamMember.find({member: req.params.memberId})
                    .populate('team')
                    .populate('member')
                    .populate('role')
                    .exec(function(err, membersTeams) {
                        if(err) return next(err);
                        console.log("Found " + membersTeams.length + " team associations.");
                        callback(null, membersTeams);
                    });
                
            },
            function(membersTeams, callback) {
                Team.find({"_id": { "$in": membersTeams.map(function(cm) {
                        return cm.team._id })
                    }
                }, function(err, teams) {
                    if(err) return next(err);
                    res.json(teams);
                    callback(null, teams);
                });
            }
        ],
        function(err, teams) {
            if(err) return next(err);
            console.log("Found teams : " + teams);
        }
    )    
});

//#################################################################################################
//#################################################################################################
router.route('/findTeamsMembers/:teamId')

//GET all members associated with this team:
.get(function(req, res, next) {
     async.waterfall(
        [
            function(callback) {
                TeamMember.find({team: req.params.teamId})
                    .populate('team')
                    .populate('member')
                    .populate('role')
                    .exec(function(err, teamMembers) {
                        if(err) return next(err);
                        console.log("Found " + teamMembers.length + " members on team.");
                        callback(null, teamMembers);
                    });
                
            },
            function(teamMembers, callback) {
                User.find({"_id": { "$in": teamMembers.map(function(cm) {
                        return cm.member._id })
                    }
                })                    
                    .populate('certifications')
                    .populate('licenses')
                    .deepPopulate('roles.role roles.club')
                    .exec(function(err, members) {
                        if(err) return next(err);
                        res.json(members);
                        callback(null, members);
                });
            }
        ],
        function(err, members) {
            if(err) return next(err);
            console.log("Found members : " + members);
        }
    )   
});


//#################################################################################################
//#################################################################################################
router.route('/getRosterSize/:teamId')

//GET a count of all PLAYERS associated with this team:
.get(function(req, res, next) {
     async.waterfall(
        [
            function(callback) {
                Role.findOne({name: "PLAYER"})
                    .exec(function(err, role) {
                        if(err) return next(err);
                        console.log("Retrieved ROLE: " + role);
                        callback(null, role._id);
                });
            },
            function(roleId, callback) {
                console.log("\n\nWill be searching with teamID: " + req.params.teamId + " and roleID: " + roleId);
                TeamMember.find({$and: [
                        {team: req.params.teamId},
                        {role:  roleId}
                    ]})
                    .populate('team')
                    .populate('member')
                    .populate('role')
                    .exec(function(err, members) {
                    if(err) return next(err);
                    callback(null, members);
                });
            }
        ],
        function(err, members) {
            if(err) return next(err);
            console.log("Found members : " + members);   
            res.json(members.length);
        }
    ) 
});

module.exports = router;