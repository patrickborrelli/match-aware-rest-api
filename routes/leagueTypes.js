var express = require('express');
var bodyParser = require('body-parser');
var LeagueType = require('../models/leagueType');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all league types
.get(Verify.verifyOrdinaryUser, function(req, res) {
    LeagueType.find(req.query)
        .sort({ name: -1 })
        .exec(function(err, types) {
            if(err) throw err;
            res.json(types);
    });
})

//POST add league types
.post(Verify.verifyOrdinaryUser, function(req, res) {
    LeagueType.create(req.body, function(err, type) {
        if(err) return next(err);
        console.log("New league type created");
        res.json(type);
    });
})

//DELETE all league types
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    LeagueType.find({}, function(err, types) {
        if(err) return next(err);
        console.log("Removing all league types from system.");
        console.log(types.length + " league types were found and are pending delete.");
        for(var i = types.length -1; i >= 0; i--) {
            types[i].remove();
        }
        res.json("Successfully removed all league types.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:leagueTypeId')

///GET league type by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    LeagueType.findById(req.params.leagueTypeId)
        .exec(function(err, type) {
            if(err) throw err;
            res.json(type);
    });
})

//PUT update league type by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    LeagueType.findByIdAndUpdate(req.params.leagueTypeId, {$set: req.body}, {new: true}) 
        .exec(function(err, type) {
            if(err) throw err;
            res.json(type);
    });
})

///DELETE league type by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    LeagueType.findById(req.params.leagueTypeId)
        .exec(function(err, type) {
            if(err) throw err;
            type.remove();
            res.json("Successfully removed league type " + type.name);
    });
});


module.exports = router;