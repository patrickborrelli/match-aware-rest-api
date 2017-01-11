var express = require('express');
var bodyParser = require('body-parser');
var Gender = require('../models/gender');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all genders:
.get(function(req, res) {
    Gender.find({})
        .exec(function(err, genders) {
            if(err) throw err;
            res.json(genders);
    });    
})

//add a new gender to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Gender.create(req.body, function(err, gender) {
        if(err) return next(err);
        console.log("New gender created");
        res.json(gender);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Gender.remove({}, function(err, genders) {
        if(err) return next(err);
        console.log("Removed: \n" + genders);
        res.json("All genders removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:genderId')

///GET gender by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    Gender.findById(req.params.genderId)
        .exec(function(err, gender) {
            if(err) throw err;
            res.json(gender);
    });
})

//PUT update gender by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    Gender.findByIdAndUpdate(req.params.genderId, {$set: req.body}, {new: true}) 
        .exec(function(err, gender) {
            if(err) throw err;
            res.json(gender);
    });
})

///DELETE gender by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    Gender.findById(req.params.genderId)
        .exec(function(err, gender) {
            if(err) throw err;
            gender.remove();
            res.json("Successfully removed gender " + gender.name);
    });
});

module.exports = router;