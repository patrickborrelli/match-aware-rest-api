var express = require('express');
var bodyParser = require('body-parser');
var League = require('../models/league');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all leagues:
.get(function(req, res, next) {
    League.find(req.query)            
        .sort({ name: 'asc' })
        .populate('min_age_group')
        .populate('max_age_group')
        .populate('type')
        .exec(function(err, leagues) {
            if(err) throw err;
            res.json(leagues);
    });    
})

//add a new league to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    League.create(req.body, function(err, league) {
        if(err) return next(err);
        console.log("New league created");
        res.json(league);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    League.remove({}, function(err, leagues) {
        if(err) return next(err);
        console.log("Removed: \n" + leagues);
        res.json("All leagues removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:leagueId')

///GET league by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    League.findById(req.params.leagueId)
        .populate('min_age_group')
        .populate('max_age_group')
        .populate('type')
        .exec(function(err, league) {
            if(err) throw err;
            res.json(league);
    });
})

//PUT update league by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    League.findByIdAndUpdate(req.params.leagueId, {$set: req.body}, {new: true}) 
        .populate('min_age_group')
        .populate('max_age_group')
        .populate('type')
        .exec(function(err, league) {
            if(err) throw err;
            res.json(league);
    });
})

///DELETE league by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    League.findById(req.params.leagueId)
        .exec(function(err, league) {
            if(err) throw err;
            league.remove();
            res.json("Successfully removed league " + league.name);
    });
});

module.exports = router;