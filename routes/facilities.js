var express = require('express');
var bodyParser = require('body-parser');
var Facility = require('../models/facility');
var Field = require('../models/field');
var Closure = require('../models/closure');
var FieldSize = require('../models/fieldSize');
var deepPopulate = require('mongoose-deep-populate');
var async = require('async');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all facilities:
.get(function(req, res, next) {
    Facility.find(req.query)
        .sort({ name: 'asc' })
        .populate('club_affiliation')
        .deepPopulate('fields.size fields.closures')
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
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
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
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Facility.findByIdAndUpdate(req.params.facilityId, {$set: req.body}, {new: true}) 
        .exec(function(err, facility) {
            if(err) throw err;
            res.json(facility);
    });
})

///DELETE facility by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
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

///PUT add a field to a facility by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
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
router.route('/closeFacility/:facilityId/:closureId')

///PUT close this facility and all of its fields based on the facility closure
.put(Verify.verifyOrdinaryUser, function(req, res, next) {

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
                var count = facility.fields.length;
                var flds = facility.fields;
                var newFields = [];
                
                console.log("will now update " + count + " fields");    
                
                async.forEach(flds, function(fld, callback) { 
                    Field.findById(fld._id) 
                        .exec(function(err, field) {
                            if(err) throw err;
                            field.closures.push(req.params.closureId);
                            field.save(function(err, field) {
                                if(err) return next(err);
                                newFields.push(field);
                                callback();
                            });                             
                    });                
                }, function(err) {
                    if (err) return next(err);
                    facility.fields = newFields;
                    callback(null, facility);
                });
            }, 
            function(facility, callback) {
                facility.closures.push(req.params.closureId);
                facility.save(function(err, facility) {
                    if(err) return next(err);
                    callback(null, facility);
                })
            }
        ],
        function(err, facility) {
            res.json(facility);
        }
    ) 
});

//#################################################################################################
//#################################################################################################
router.route('/deleteAllClosures/:facilityId')

///PUT remove all closures for this facility and all of its fields
.put(Verify.verifyOrdinaryUser, function(req, res, next) {

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
                var count = facility.fields.length;
                var flds = facility.fields;
                var newFields = [];
                
                console.log("will now update " + count + " fields");    
                
                async.forEach(flds, function(fld, callback) { 
                    Field.findById(fld._id) 
                        .exec(function(err, field) {
                            if(err) throw err;
                            field.closures = [];
                            field.save(function(err, field) {
                                if(err) return next(err);
                                newFields.push(field);
                                callback();
                            });                             
                    });                
                }, function(err) {
                    if (err) return next(err);
                    facility.fields = newFields;
                    callback(null, facility);
                });
            }, 
            function(facility, callback) {
                facility.closures = [];
                facility.save(function(err, facility) {
                    if(err) return next(err);
                    callback(null, facility);
                })
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

///PUT open all fields in a closed facility
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    //first, get all closures for this facility, find any that have a start time less than current and an end time greater than current.
    //if so, change end time to current.
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
                        var now = new Date().getTime();
                        var affectedClosureIds = [];
                        //iterate through any closures, find any that are current, add them to an array
                        console.log("Facility has " + facility.closures.length + " closures");
                        for(var i = 0; i < facility.closures.length; i++) {
                            console.log("for first closure, comparing start time of " + facility.closures[i].start + " and end time of " + facility.closures[i].end + " with current time: " + now);
                            if(facility.closures[i].start < now && facility.closures[i].end > now) {
                                console.log("Closure is current, changing end time from " + facility.closures[i].end + " to " + now);
                                affectedClosureIds.push(facility.closures[i]._id);
                            }
                        }
                        callback(null, facility, affectedClosureIds);
                });  
            },
            function(facility, affectedClosures, callback) {
                //now grab all fields for the facility and do the same:
                var count = affectedClosures.length;
                
                console.log("will now update " + count + " closures");    
                
                async.forEach(affectedClosures, function(closure, callback) { 
                    Closure.findById(closure) 
                        .exec(function(err, clos) {
                            if(err) throw err;
                            var now = new Date().getTime();
                            clos.end = now;
                            clos.save(function(err, closure) {
                                if(err) return next(err);
                                callback();
                            });                             
                    });                
                }, function(err) {
                    if (err) return next(err);
                    callback(null, facility);
                });                
            }, 
            function(facility, callback) {
                facility.save(function(err, facility) {
                    if(err) return next(err);
                    callback(null, facility);
                })
            }
        ],
        function(err, facility) {
            res.json(facility);
        }
    )     
});

//#################################################################################################
//#################################################################################################
router.route('/reopenFields/:facilityId')

///PUT open any of this open facility's fields that are currently closed
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    //first, retrieve the facility
    async.waterfall(
        [
            function(callback) {
                Facility.findById(req.params.facilityId)
                    .populate('club_affiliation')
                    .deepPopulate('fields.closures')
                    .exec(function(err, facility) {
                        if(err) throw err;                        
                        callback(null, facility);
                });  
            },
            function(facility, callback) {
                //now grab all fields for the facility:
                var fields = facility.fields;
                                
                async.forEach(fields, function(field, callback) { 
                    var fieldClosures = field.closures;
                    
                    
                    async.forEach(fieldClosures, function(closure, callback) {
                        Closure.findById(closure) 
                            .exec(function(err, clos) {
                                if(err) throw err;
                                var now = new Date().getTime();
                                clos.end = now;
                                clos.save(function(err, closure) {
                                    if(err) return next(err);
                                    callback();
                                });                             
                        });
                    })
                    
                    
                    
                }, function(err) {
                    if (err) return next(err);
                    callback(null, facility);
                });                
            }, 
            function(facility, callback) {
                facility.save(function(err, facility) {
                    if(err) return next(err);
                    callback(null, facility);
                })
            }
        ],
        function(err, facility) {
            res.json(facility);
        }
    )     
});


module.exports = router;