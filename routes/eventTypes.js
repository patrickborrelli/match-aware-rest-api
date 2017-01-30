var express = require('express');
var bodyParser = require('body-parser');
var EventType = require('../models/eventType');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all event types
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    EventType.find(req.query)
        .sort({ name: 'asc' })
        .exec(function(err, eventTypes) {
            if(err) throw err;
            res.json(eventTypes);
    });
})

//POST add event types
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    EventType.create(req.body, function(err, eventType) {
        if(err) return next(err);
        console.log("New event type created");
        res.json(eventType);
    });
})

//DELETE all event types
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    EventType.find({}, function(err, eventTypes) {
        if(err) return next(err);
        console.log("Removing all event types from system.");
        console.log(eventTypes.length + " event types were found and are pending delete.");
        for(var i = eventTypes.length -1; i >= 0; i--) {
            eventTypes[i].remove();
        }
        res.json("Successfully removed all event types.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:eventTypeId')

///GET event type by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    EventType.findById(req.params.eventTypeId)
        .exec(function(err, type) {
            if(err) throw err;
            res.json(type);
    });
})

//PUT update event type by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    EventType.findByIdAndUpdate(req.params.eventTypeId, {$set: req.body}, {new: true}) 
        .exec(function(err, type) {
            if(err) throw err;
            res.json(type);
    });
})

///DELETE event type by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    EventType.findById(req.params.eventTypeId)
        .exec(function(err, type) {
            if(err) throw err;
            type.remove();
            res.json("Successfully removed event type " + type.name);
    });
});


module.exports = router;