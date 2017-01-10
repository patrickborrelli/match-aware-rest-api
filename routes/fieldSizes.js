var express = require('express');
var bodyParser = require('body-parser');
var FieldSize = require('../models/fieldSize');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all field sizes
.get(Verify.verifyOrdinaryUser, function(req, res) {
    FieldSize.find(req.query)
        .exec(function(err, sizes) {
            if(err) throw err;
            res.json(sizes);
    });
})

//POST add field sizes
.post(Verify.verifyOrdinaryUser, function(req, res) {
    FieldSize.create(req.body, function(err, size) {
        if(err) return next(err);
        console.log("New field size created");
        res.json(size);
    });
})

//DELETE all field sizes
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    FieldSize.find({}, function(err, sizes) {
        if(err) return next(err);
        console.log("Removing all field sizes from system.");
        console.log(sizes.length + " field sizes were found and are pending delete.");
        for(var i = sizes.length -1; i >= 0; i--) {
            sizes[i].remove();
        }
        res.json("Successfully removed all field sizes.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:sizeId')

///GET field size by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    FieldSize.findById(req.params.sizeId)
        .exec(function(err, size) {
            if(err) throw err;
            res.json(size);
    });
})

//PUT update field size by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    FieldSize.findByIdAndUpdate(req.params.sizeId, {$set: req.body}, {new: true}) 
        .exec(function(err, size) {
            if(err) throw err;
            res.json(size);
    });
})

///DELETE field size by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    FieldSize.findById(req.params.sizeId)
        .exec(function(err, size) {
            if(err) throw err;
            size.remove();
            res.json("Successfully removed field size " + size.name);
    });
});


module.exports = router;