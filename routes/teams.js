var express = require('express');
var bodyParser = require('body-parser');
var Team = require('../models/team');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all teams:
.get(function(req, res) {
    Team.find({})
        .populate('gender')
        .populate('age_group')
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
        .exec(function(err, team) {
            if(err) throw err;
            fullName = team.age_group.name + team.gender.short_name + " " + team.name;
            team.remove();
            res.json("Successfully removed team " + fullName);
    });
});

module.exports = router;