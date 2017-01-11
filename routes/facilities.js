var express = require('express');
var bodyParser = require('body-parser');
var Facility = require('../models/facility');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all facilities:
.get(function(req, res) {
    Facility.find({})
        .exec(function(err, facilities) {
            if(err) throw err;
            res.json(facilities);
    });    
})

//add a new facility to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Facility.create(req.body, function(err, facility) {
        if(err) return next(err);
        console.log("New facility created");
        res.json(facility);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Facility.remove({}, function(err, facilities) {
        if(err) return next(err);
        console.log("Removed: \n" + facilities);
        res.json("All facilities removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:facilityId')

///GET facility by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    Facility.findById(req.params.facilityId)
        .exec(function(err, facility) {
            if(err) throw err;
            res.json(facility);
    });
})

//PUT update facility by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    Facility.findByIdAndUpdate(req.params.facilityId, {$set: req.body}, {new: true}) 
        .exec(function(err, facility) {
            if(err) throw err;
            res.json(facility);
    });
})

///DELETE facility by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    Facility.findById(req.params.facilityId)
        .exec(function(err, facility) {
            if(err) throw err;
            facility.remove();
            res.json("Successfully removed facility " + facility.name);
    });
});

module.exports = router;