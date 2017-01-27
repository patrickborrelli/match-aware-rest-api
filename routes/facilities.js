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
    Facility.find(req.query)
        .sort({ name: -1 })
        .populate('club_affiliation')
        .populate({ 
             path: 'fields',
             model: 'Field',
             populate: {
               path: 'size',
               model: 'FieldSize'
             }
          })
        .populate('closures')
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
        .populate('closures')
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
                    .populate('closures')
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
});


//#################################################################################################
//#################################################################################################
router.route('/closeFacility/:facilityId')

///PUT close this facility and all of its fields based on the facility closure
.put(Verify.verifyOrdinaryUser, function(req, res, next) {

    async.waterfall(
        [
            function(callback) {
                Facility.findByIdAndUpdate(req.params.facilityId, {$set: req.body}, {new: true})
                    .populate('club_affiliation')
                    .populate({ 
                         path: 'fields',
                         model: 'Field',
                         populate: {
                           path: 'size',
                           model: 'FieldSize'
                         }
                      })
                    .populate('closures')
                    .exec(function(err, facility) {
                        if(err) throw err;
                        callback(null, facility);
                });  
            },
            function(facility, callback) {
                var count = facility.fields.length;
                var flds = facility.fields;
                var newFields = [];
                
                console.log("will now update " + count + " fields");    
                
                async.forEach(flds, function(fld, callback) { 
                    Field.findByIdAndUpdate(fld._id, 
                            {$set: 
                                {   
                                    closure: facility.closure, 
                                    closure_type: facility.closure_type,
                                    close_start: facility.close_start,
                                    close_end: facility.close_end
                                }
                             }, {new: true}) 
                        .exec(function(err, field) {
                            if(err) throw err;
                            newFields.push(field);
                            callback(); 
                    });                
                }, function(err) {
                    if (err) return next(err);
                    facility.fields = newFields;
                    callback(null, facility);
                });
            }
        ],
        function(err, facility) {
            res.json(facility);
        }
    ) 
});


//#################################################################################################
//#################################################################################################
router.route('/openFacility/:facilityId')

///PUT open all of this facility's fields
.put(Verify.verifyOrdinaryUser, function(req, res, next) {

    async.waterfall(
        [
            function(callback) {
                Facility.findByIdAndUpdate(req.params.facilityId, {$set: 
                                {   
                                    closure: false,
                                    closure_type: "",
                                    close_start: 0,
                                    close_end: 0
                                }
                             }, {new: true})   
                    .populate('club_affiliation')
                    .populate({ 
                         path: 'fields',
                         model: 'Field',
                         populate: {
                           path: 'size',
                           model: 'FieldSize'
                         }
                      })
                    .populate('closures')
                    .exec(function(err, facility) {
                        if(err) throw err;
                        callback(null, facility);
                });  
            },
            function(facility, callback) {
                var count = facility.fields.length;
                var flds = facility.fields;
                var newFields = [];
                
                console.log("will now update " + count + " fields");    
                
                async.forEach(flds, function(fld, callback) { 
                    Field.findByIdAndUpdate(fld._id, 
                            {$set: 
                                {   
                                    closure: false,
                                    closure_type: "",
                                    close_start: 0,
                                    close_end: 0
                                }
                             }, {new: true}) 
                        .exec(function(err, field) {
                            if(err) throw err;
                            newFields.push(field);
                            callback(); 
                    });                
                }, function(err) {
                    if (err) return next(err);                    
                    facility.fields = newFields;
                    callback(null, facility);
                });
            }
        ],
        function(err, facility) {
            res.json(facility);
        }
    ) 
});

module.exports = router;