var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var LeagueTeam = require('../models/leagueTeam');
var Team = require('../models/team');
var League = require('../models/league');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all league teams:
.get(function(req, res, next) {
    LeagueTeam.find(req.query)
        .populate('team')
        .populate('league')
        .populate('added_by')
        .exec(function(err, leagueTeams) {
            if(err) throw err;
            res.json(leagueTeams);
    });    
})

//POST a new team to a league:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    LeagueTeam.create(req.body, function(err, leagueTeam) {
        if(err) return next(err);
        console.log("Team added to league");
        res.json(leagueTeam);
    });
})

//DELETE all league teams
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    LeagueTeam.remove({}, function(err, leagueTeams) {
        if(err) return next(err);
        console.log("Removed: \n" + leagueTeams);
        res.json("All teams removed from leagues.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:teamId')

//DELETE all leagues for team
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    LeagueTeam.find({team: req.params.teamId}, function(err, leagueTeams) {
        if(err) return next(err);
        for(var i = 0; i < leagueTeams.length; i++) {
            leagueTeams[i].remove();
        }
        console.log("Removed: \n" + leagueTeams);
        res.json("All leagues removed for team.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/removeTeamFromLeague/:teamId/:leagueId')

///DELETE team from league by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    var fullName;
    LeagueTeam.findById(req.params.leagueTeamId)
        .populate('team')
        .populate('league')
        .exec(function(err, leagueTeam) {
            if(err) throw err;
            fullName = leagueTeam.team.name + " - " + leagueTeam.league.name;
            leagueTeam.remove();
            res.json("Successfully removed team from league " + fullName);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findLeagueTeams/:leagueId')

//GET all teams that play in this league:
.get(function(req, res, next) {
    async.waterfall(
        [
            function(callback) {
                LeagueTeam.find({league: req.params.leagueId})
                    .populate('team')
                    .populate('league')
                    .populate('added_by')
                    .exec(function(err, leaguesTeams) {
                        if(err) return next(err);
                        console.log("Found " + leaguesTeams.length + " teams in this league.");
                        callback(null, leaguesTeams);
                    });
                
            },
            function(leaguesTeams, callback) {
                Team.find({"_id": { "$in": leaguesTeams.map(function(cm) {
                        return cm.team._id })
                    }
                })
                    .sort({ name: 'asc' })
                    .exec(function(err, teams) {
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
router.route('/findTeamsLeagues/:teamId')

//GET all leagues associated with this team:
.get(function(req, res, next) {
     async.waterfall(
        [
            function(callback) {
                LeagueTeam.find({team: req.params.teamId})
                    .populate('team')
                    .populate('league')
                    .populate('added_by')
                    .exec(function(err, leagueTeams) {
                        if(err) return next(err);
                        console.log("Found " + leagueTeams.length + " leagues for team.");
                        callback(null, leagueTeams);
                    });
                
            },
            function(leagueTeams, callback) {
                League.find({"_id": { "$in": leagueTeams.map(function(cm) {
                        return cm.league._id })
                    }
                }, function(err, leagues) {
                    if(err) return next(err);
                    res.json(leagues);
                    callback(null, leagues);
                });
            }
        ],
        function(err, leagues) {
            if(err) return next(err);
            console.log("Found leagues : " + leagues);
        }
    )    
    
});

module.exports = router;