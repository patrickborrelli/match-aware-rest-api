var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var Team = require('../models/team');
var AgeGroup = require('../models/ageGroup');
var LeagueTeam = require("../models/leagueTeam");
var TeamMember = require("../models/teamMember");
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all teams:
.get(function(req, res) {
    Team.find(req.query)
        .sort({ name: 'asc' })
        .populate('gender')
        .populate('age_group')
        .populate('club')
        .exec(function(err, teams) {
            if(err) throw err;
            res.json(teams);
    });    
})

//add a new team to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Team.create(req.body, function(err, team) {
        if(err) return next(err);
        console.log("New team created");
        res.json(team);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Team.remove({}, function(err, teams) {
        if(err) return next(err);
        console.log("Removed: \n" + teams);
        res.json("All teams removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:teamId')

///GET team by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    Team.findById(req.params.teamId)
        .populate('gender')
        .populate('age_group')
        .populate('club')
        .exec(function(err, team) {
            if(err) throw err;
            res.json(team);
    });
})

//PUT update team by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    Team.findByIdAndUpdate(req.params.teamId, {$set: req.body}, {new: true}) 
        .exec(function(err, team) {
            if(err) throw err;
            res.json(team);
    });
})

///DELETE team by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    var fullName;
    Team.findById(req.params.teamId)
        .populate('gender')
        .populate('age_group')
        .populate('club')
        .exec(function(err, team) {
            if(err) throw err;
            fullName = team.age_group.name + team.gender.short_name + " " + team.name;
            team.remove();
            res.json("Successfully removed team " + fullName);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/getTeamWithLeagues/teams')

///GET retrieve all teams along with all leagues the team participates in
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    var newTeams = [];
    var teamsWithCoach = [];

    async.waterfall(
        [
            function(callback) {
                Team.find(req.query)
                    .populate('gender')
                    .populate('age_group')
                    .populate('club')
                    .exec(function(err, teams) {
                        if(err) throw err;
                        callback(null, teams);
                });  
            },
            function(teams, callback) {     
                async.forEach(teams, function(team, callback) { 
                    var myleagues = [];
                    LeagueTeam.find({team: team._id}) 
                        .populate('team')
                        .populate('league')
                        .exec(function(err, leagueTeams) {
                            if(err) throw err;
                            console.log("Found " + leagueTeams.length + " leagues for team " + team.name);
                            console.log(leagueTeams);
                            for(var i = 0; i < leagueTeams.length; i++) {
                                myleagues.push(leagueTeams[i].league);
                            }
                            var newTeam = {
                                _id: team._id,
                                name: team.name,
                                gender: team.gender,
                                age_group: team.age_group,
                                club: team.club,
                                leagues: myleagues
                            }
                            newTeams.push(newTeam);
                            callback();                            
                    });                
                }, function(err) {
                    if (err) return next(err);
                    callback(null, newTeams);
                });
            },
            function(newTeams, callback) {     
                async.forEach(newTeams, function(team, callback) { 
                    TeamMember.find({team: team._id}) 
                        .populate('team')
                        .populate('member')
                        .populate('role')
                        .exec(function(err, members) {
                            if(err) throw err;
                            console.log("Found " + members.length + " members for team " + team.name);
                            console.log(members);
                            var newTeamWithCoach = {
                                _id: team._id,
                                name: team.name,
                                gender: team.gender,
                                age_group: team.age_group,
                                club: team.club,
                                leagues: team.leagues
                            }
                            for(var i = 0; i < members.length; i++) {
                                if(members[i].role.name == 'COACH') {
                                    newTeamWithCoach.headcoach = members[i].member;
                                    break;
                                }
                            }
                            
                            teamsWithCoach.push(newTeamWithCoach);
                            callback();                            
                    });                
                }, function(err) {
                    if (err) return next(err);
                    callback(null, teamsWithCoach);
                });
            }
        ],
        function(err, teamsWithCoach) {
            res.json(teamsWithCoach);
        }
    ) 
});

//#################################################################################################
//#################################################################################################
router.route('/getTeamsInAgeRange/:minBirthYear/:maxBirthYear')

///GET retrieve all teams that are between the provided age ranges:
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    var myTeams = [];    
    var low = parseInt(req.params.minBirthYear);
    var high = parseInt(req.params.maxBirthYear);
    var swap;
    var birthYears = [];
    var ageGroups = [];    
    
    //correct for any possiblity of the dates being swapped:
    console.log("Received min: " + low + " and max: " + high);
    if(low > high) {
        swap = low;
        low = high;
        high = swap;
        console.log("Corrected min: " + low + " and max: " + high);
    }
    
    //build array of birth years to check
    while(low <= high) {
        birthYears.push(low.toString());
        low++;
    }
    
    async.waterfall(
        [
            function(wfCallback) {     
                async.forEach(birthYears, function(birthYear, callback) { 
                    AgeGroup.findOne({birth_year: birthYear})
                        .exec(function(err, group) {
                            if(err) throw err;
                            ageGroups.push(group);
                            callback();                            
                    });                
                }, function(err) {
                    if (err) return next(err);
                    wfCallback(null, ageGroups);
                });
            },
            function(ageGroups, wfCallback) {
                async.forEach(ageGroups, function(ageGroup, callback) { 
                    Team.find({age_group: ageGroup})                    
                        .populate('gender')
                        .populate('age_group')
                        .populate('club')
                        .exec(function(err, teams) {
                            if(err) throw err;
                            console.log("Found " + teams.length + " teams in age group " + ageGroup.name);
                            console.log(teams);
                            for(var i = 0; i < teams.length; i++) {
                                myTeams.push(teams[i]);
                            } 
                        callback();
                    });                
                }, function(err) {
                    if (err) return next(err);
                    wfCallback(null, myTeams);
                });
            }
        ],
        function(err, myTeams) {
            res.json(myTeams);
        }
    ) 
});

module.exports = router;