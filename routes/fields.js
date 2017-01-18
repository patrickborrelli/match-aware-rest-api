var express = require('express');
var bodyParser = require('body-parser');
var Field = require('../models/field');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all fields:
.get(function(req, res) {
    Field.find(req.query)
        .populate('facility')
        .populate('size')
        .exec(function(err, fields) {
            if(err) throw err;
            res.json(fields);
    });    
})

//add a new field to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Field.create(req.body, function(err, field) {
        if(err) return next(err);
        console.log("New field created");
        res.json(field);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Field.remove({}, function(err, fields) {
        if(err) return next(err);
        console.log("Removed: \n" + fields);
        res.json("All fields removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:fieldId')

///GET field by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    Field.findById(req.params.fieldId)
        .populate('facility')
        .populate('size')
        .exec(function(err, field) {
            if(err) throw err;
            res.json(field);
    });
})

//PUT update field by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    Field.findByIdAndUpdate(req.params.fieldId, {$set: req.body}, {new: true}) 
        .exec(function(err, field) {
            if(err) throw err;
            res.json(field);
    });
})

///DELETE field by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    Field.findById(req.params.fieldId)    
        .populate('facility')
        .populate('size')
        .exec(function(err, field) {
            if(err) throw err;
            field.remove();
            res.json("Successfully removed field " + field.facility.short_name + field.name);
    });
});

module.exports = router;