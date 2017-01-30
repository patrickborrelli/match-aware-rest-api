var express = require('express');
var bodyParser = require('body-parser');
var Closure = require('../models/closure');
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


module.exports = router;