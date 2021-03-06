var express = require('express');
var bodyParser = require('body-parser');
var AgeGroup = require('../models/ageGroup');
var async = require('async');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all age groups
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    AgeGroup.find(req.query)
        .sort({ name: -1 })
        .exec(function(err, groups) {
            if(err) throw err;
            res.json(groups);
    });
})

//POST add age groups
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    async.waterfall(
        [
            function(callback) {
                AgeGroup.findOne({birth_year: req.body.birth_year, soccer_year: req.body.soccer_year})
                    .exec(function(err, group) {
                        if(err) return next(err);
                        callback(null, group);
                    });
            },
            function(group, callback) {
                console.log("Retrieved group : " );
                console.log(group);
                if(group != null) {
                    console.log("Group already exists, not creating new");
                    callback(null, group)
                } else {
                    AgeGroup.create(req.body, function(err, newgroup) {
                        if(err) return next(err);
                        console.log("New age group created");
                        callback(null, newgroup);
                    });
                }                
            }
        ],
        function(err, group) {
            if(err) return next(err);
            res.json(group);
        }
    )    
})

//DELETE all age groups
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    AgeGroup.find({}, function(err, groups) {
        if(err) return next(err);
        console.log("Removing all age groups from system.");
        console.log(groups.length + " age groups were found and are pending delete.");
        for(var i = groups.length -1; i >= 0; i--) {
            groups[i].remove();
        }
        res.json("Successfully removed all age groups.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:agegroupId')

///GET age group by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    AgeGroup.findById(req.params.agegroupId)
        .exec(function(err, group) {
            if(err) throw err;
            res.json(group);
    });
})

//PUT update age group by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    AgeGroup.findByIdAndUpdate(req.params.agegroupId, {$set: req.body}, {new: true}) 
        .exec(function(err, group) {
            if(err) throw err;
            res.json(group);
    });
})

///DELETE age group by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    AgeGroup.findById(req.params.agegroupId)
        .exec(function(err, group) {
            if(err) throw err;
            group.remove();
            res.json("Successfully removed age group " + group.name);
    });
});


module.exports = router;