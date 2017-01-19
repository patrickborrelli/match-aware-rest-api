var express = require('express');
var bodyParser = require('body-parser');
var Facility = require('../models/facility');
var Field = require('../models/field');
var FieldSize = require('../models/fieldSize');
var async = require('async');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all facilities:
.get(function(req, res) {
    Facility.find({})
        .populate('club_affiliation')
        .populate({ 
             path: 'fields',
             model: 'Field',
             populate: {
               path: 'size',
               model: 'FieldSize'
             }
          })
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
        .populate('club_affiliation')
        .populate({ 
             path: 'fields',
             model: 'Field',
             populate: {
               path: 'size',
               model: 'FieldSize'
             }
          })
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

//#################################################################################################
//#################################################################################################
router.route('/addField/:facilityId/:fieldId')

///POST add a field to a facility by ID
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    async.waterfall(
        [
            function(callback) {
                Facility.findById(req.params.facilityId)
                    .populate('club_affiliation')
                    .populate({ 
                         path: 'fields',
                         model: 'Field',
                         populate: {
                           path: 'size',
                           model: 'FieldSize'
                         }
                      })
                    .exec(function(err, facility) {
                        if(err) throw err;
                        callback(null, facility);
                });
                
            },
            function(facility, callback) {
                //add the facility id to the field and save the field:
                Field.findByIdAndUpdate(req.params.fieldId, {$set: {facility: facility._id}}, {new: true}) 
                    .exec(function(err, field) {
                        if(err) throw err;
                        callback(null, facility, field);
                });                             
            }, 
            function(facility, field, callback) {
                console.log("attempting to put field: " + field);
                console.log("into facility: " + facility);
                //now, push the field into the facility and save it.
                facility.fields.push(field);
                facility.save()
                    .then(function(facility) {
                    console.log("Successfully saved " + facility);
                    callback(null, facility);
                },function(errResponse) {
                    console.log("Here is where it all falls down " + errResponse);
                });
            }
        ],
        function(err, facility) {
            if(err) return next(err);        
            res.json(facility);
        }
    )
})

module.exports = router;