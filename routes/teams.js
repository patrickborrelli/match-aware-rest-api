var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var Team = require('../models/team');
var LeagueTeam = require("../models/leagueTeam")
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
            }
        ],
        function(err, newTeams) {
            res.json(newTeams);
        }
    ) 
});

module.exports = router;