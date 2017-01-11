var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var TeamCoach = require('../models/teamCoach');
var Team = require('../models/team');
var User = require('../models/user');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all team coaches:
.get(function(req, res) {
    TeamCoach.find({})
        .populate('team')
        .populate('coach')
        .exec(function(err, teamCoaches) {
            if(err) throw err;
            res.json(teamCoaches);
    });    
})

//POST a new coach to a team:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamCoach.create(req.body, function(err, teamCoach) {
        if(err) return next(err);
        console.log("New teamCoach created");
        res.json(teamCoach);
    });
})

//DELETE all team coaches
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamCoach.remove({}, function(err, teamCoaches) {
        if(err) return next(err);
        console.log("Removed: \n" + teamCoaches);
        res.json("All teamCoaches removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:teamCoachId')

///DELETE teamCoach by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    var fullName;
    TeamCoach.findById(req.params.teamCoachId)
        .populate('team')
        .populate('coach')
        .exec(function(err, teamCoach) {
            if(err) throw err;
            fullName = teamCoach.team.name + " " + teamCoach.coach.getFullName();
            teamCoach.remove();
            res.json("Successfully removed teamCoach " + fullName);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findCoachesTeams/:coachId')

//GET all teams this user coaches:
.get(function(req, res) {
    async.waterfall(
        [
            function(callback) {
                TeamCoach.find({coach: req.params.coachId})
                    .populate('team')
                    .populate('coach')
                    .exec(function(err, coachesTeams) {
                        if(err) return next(err);
                        console.log("Found " + coachesTeams.length + " coached teams.");
                        callback(null, coachesTeams);
                    });
                
            },
            function(coachesTeams, callback) {
                Team.find({"_id": { "$in": coachesTeams.map(function(cm) {
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
router.route('/findTeamsCoaches/:teamId')

//GET all coaches associated with this team:
.get(function(req, res) {
     async.waterfall(
        [
            function(callback) {
                TeamCoach.find({team: req.params.teamId})
                    .populate('team')
                    .populate('coach')
                    .exec(function(err, teamCoaches) {
                        if(err) return next(err);
                        console.log("Found " + teamCoaches.length + " coaches for team.");
                        callback(null, teamCoaches);
                    });
                
            },
            function(teamCoaches, callback) {
                User.find({"_id": { "$in": teamCoaches.map(function(cm) {
                        return cm.coach._id })
                    }
                }, function(err, coaches) {
                    if(err) return next(err);
                    res.json(coaches);
                    callback(null, coaches);
                });
            }
        ],
        function(err, coaches) {
            if(err) return next(err);
            console.log("Found coaches : " + coaches);
        }
    )    
    
});

module.exports = router;