var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var Closure = require('../models/closure');
var Field = require('../models/field');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all closures
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Closure.find(req.query)
        .sort({ start: 'asc' })
        .exec(function(err, closures) {
            if(err) throw err;
            res.json(closures);
    });
})

//POST add closure
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Closure.create(req.body, function(err, closure) {
        if(err) return next(err);
        console.log("New closure created");
        res.json(closure);
    });
})

//DELETE all closures
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Closure.find({}, function(err, closures) {
        if(err) return next(err);
        console.log("Removing all closures from system.");
        console.log(closures.length + " closures were found and are pending delete.");
        for(var i = closures.length -1; i >= 0; i--) {
            closures[i].remove();
        }
        res.json("Successfully removed all closures.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:closureId')

///GET closure by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Closure.findById(req.params.closureId)
        .exec(function(err, closure) {
            if(err) throw err;
            res.json(closure);
    });
})

//PUT update closure by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Closure.findByIdAndUpdate(req.params.closureId, {$set: req.body}, {new: true}) 
        .exec(function(err, closure) {
            if(err) throw err;
            res.json(closure);
    });
})

///DELETE closure by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Closure.findById(req.params.closureId)
        .exec(function(err, closure) {
            if(err) throw err;
            closure.remove();
            res.json("Successfully removed " + closure);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/openFieldOnly/:fieldId/:closureId')

///POST replacement closure for field by ID
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    /**
     * In the case where a closure applies to both a field and the facility as a whole, but the intent
     * is to open just the field, this path provides a mechanism to do so.
     *      1 - create a copy of the closure
     *      2 - change its end time to the current time
     *      3 - save the new closure
     *      4 - add the new closure to the field's closures array
     *      5 - remove the original closure from the field's closures array
     *      6 - save the field.
     */
    
    async.waterfall(
        [
            function(callback) {
                //first retrieve existing closure:
                Closure.findById(req.params.closureId)
                    .exec(function(err, closure) {
                        if(err) throw err;
                        callback(null, closure);
                });
            },
            function(oldClosure, callback) {
                if(oldClosure == null) {
                    var err = new Error('Closure with matching ID not found.');
                    err.status = 404;
                    return next(err);
                }
                
                console.log("Making a copy of existing closure:");
                console.log(oldClosure);
                var currentTime = new Date().getTime();
                
                Closure.create({type: oldClosure.type, start: oldClosure.start, end: currentTime, message: oldClosure.message}, function(err, newClosure) {
                    if(err) return next(err);
                    console.log("New closure created " + newClosure);
                    callback(null, newClosure, oldClosure);
                });
            },
            function(newClosure, oldClosure, callback) {
                Field.findById(req.params.fieldId)
                    .exec(function(err, field) {
                        if(err) throw err;
                        if(field == null) {
                            var err = new Error('Field with matching ID not found.');
                            err.status = 404;
                            return next(err);
                        }
                        callback(null, newClosure, oldClosure, field);
                    });                             
            },
            function(newClosure, oldClosure, field, callback) {
                var fieldClosures = field.closures;
                var index = fieldClosures.indexOf(oldClosure._id);
                
                console.log("Checking for index " + index + " in:");
                console.log(fieldClosures);
                
                if(index > -1) {
                    fieldClosures.splice(index, 1);
                }
                fieldClosures.push(newClosure._id);
                console.log("TEMP field closures now contains:");
                console.log(fieldClosures);
                
                field.closures = fieldClosures;
                
                console.log("Field closures now contains:");
                console.log(field.closures);
                
                field.save(function(err, savedField) {
                    if(err) return next(err);
                    console.log("Updated field:");
                    console.log(savedField);
                    callback(null, savedField);
                });              
            }
        ],
        function(err, savedField) {
            if(err) return next(err);
            res.json(savedField);
        }   
    )  
    
    
    
})


module.exports = router;