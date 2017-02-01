var express = require('express');
var bodyParser = require('body-parser');
var Club = require('../models/club');
var ClubRole = require('../models/clubRole');
var deepPopulate = require('mongoose-deep-populate');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all clubs
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Club.find(req.query)
        .sort({ name: 'asc' })
        .exec(function(err, clubs) {
            if(err) throw err;
            res.json(clubs);
    });
})

//POST add club
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Club.create(req.body, function(err, club) {
        if(err) return next(err);
        console.log("New club created");
        res.json(club);
    });
})

//DELETE all clubs
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Club.find({}, function(err, clubs) {
        if(err) return next(err);
        console.log("Removing all clubs from system.");
        console.log(clubs.length + " clubs were found and are pending delete.");
        for(var i = clubs.length -1; i >= 0; i--) {
            clubs[i].remove();
        }
        res.json("Successfully removed all clubs.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:clubId')

///GET club by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Club.findById(req.params.clubId)
        .exec(function(err, club) {
            if(err) throw err;
            res.json(club);
    });
})

//PUT update club by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Club.findByIdAndUpdate(req.params.clubId, {$set: req.body}, {new: true}) 
        .exec(function(err, club) {
            if(err) throw err;
            res.json(club);
    });
})

///DELETE club by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Club.findById(req.params.clubId)
        .exec(function(err, club) {
            if(err) throw err;
            club.remove();
            res.json("Successfully removed " + club.name);
    });
});


//#################################################################################################
//#################################################################################################
router.route('/getClubMembers/:clubId')

///GET all club members by club ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    ClubRole.find({club: req.params.clubId})    
        .deepPopulate('member.certifications member.licenses member.roles.role members.role.club')
        .exec(function(err, userRoles) {
            if(err) return next(err);
            var users = [];
            
            for(var i = 0; i < userRoles.length; i++) {
                users.push(userRoles[i].member);
            }
            res.json(users);
    });   
});


module.exports = router;