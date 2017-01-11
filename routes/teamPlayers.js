var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var TeamPlayer = require('../models/teamPlayer');
var Team = require('../models/team');
var User = require('../models/user');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all team players:
.get(function(req, res) {
    TeamPlayer.find({})
        .populate('team')
        .populate('player')
        .exec(function(err, teamPlayers) {
            if(err) throw err;
            res.json(teamPlayers);
    });    
})

//POST a new player to a team:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamPlayer.create(req.body, function(err, teamPlayer) {
        if(err) return next(err);
        console.log("New player added to team");
        res.json(teamPlayer);
    });
})

//DELETE all team players
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    TeamPlayer.remove({}, function(err, teamPlayers) {
        if(err) return next(err);
        console.log("Removed: \n" + teamPlayers);
        res.json("All team players removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:teamPlayerId')

///DELETE teamPlayer by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    var fullName;
    TeamPlayer.findById(req.params.teamPlayerId)
        .populate('team')
        .populate('player')
        .exec(function(err, teamPlayer) {
            if(err) throw err;
            fullName = teamPlayer.player.getFullName() + " - " + teamPlayer.team.name;
            teamPlayer.remove();
            res.json("Successfully removed team player " + fullName);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findPlayersTeams/:playerId')

//GET all teams this user plays on:
.get(function(req, res) {
    async.waterfall(
        [
            function(callback) {
                TeamPlayer.find({player: req.params.playerId})
                    .populate('team')
                    .populate('player')
                    .exec(function(err, playersTeams) {
                        if(err) return next(err);
                        console.log("Found " + playersTeams.length + " teams.");
                        callback(null, playersTeams);
                    });
                
            },
            function(playersTeams, callback) {
                Team.find({"_id": { "$in": playersTeams.map(function(cm) {
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
router.route('/findTeamsPlayers/:teamId')

//GET all players associated with this team:
.get(function(req, res) {
     async.waterfall(
        [
            function(callback) {
                TeamPlayer.find({team: req.params.teamId})
                    .populate('team')
                    .populate('player')
                    .exec(function(err, teamPlayers) {
                        if(err) return next(err);
                        console.log("Found " + teamPlayers.length + " players for team.");
                        callback(null, teamPlayers);
                    });
                
            },
            function(teamPlayers, callback) {
                User.find({"_id": { "$in": teamPlayers.map(function(cm) {
                        return cm.player._id })
                    }
                }, function(err, players) {
                    if(err) return next(err);
                    res.json(players);
                    callback(null, players);
                });
            }
        ],
        function(err, players) {
            if(err) return next(err);
            console.log("Found players : " + players);
        }
    )    
    
});

//#################################################################################################
//#################################################################################################
router.route('/getRosterSize/:teamId')

//GET a count of all players on this team's roster:
.get(function(req, res) {
    TeamPlayer.find({team: req.params.teamId})
        .populate('team')
        .populate('player')
        .exec(function(err, teamPlayers) {  
            if(err) return next(err);
            console.log("Found " + teamPlayers.length + " players for team.");
            res.json(teamPlayers.length);
        });
});
    
module.exports = router;