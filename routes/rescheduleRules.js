var express = require('express');
var bodyParser = require('body-parser');
var RescheduleRule = require('../models/rescheduleRule');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all reschedule rules
.get(Verify.verifyOrdinaryUser, function(req, res) {
    RescheduleRule.find(req.query)
        .exec(function(err, rules) {
            if(err) throw err;
            res.json(rules);
    });
})

//POST add reschedule rules
.post(Verify.verifyOrdinaryUser, function(req, res) {
    RescheduleRule.create(req.body, function(err, rule) {
        if(err) throw err;
        console.log("New reschedule rule created");
        res.json(rule);
    });
})

//DELETE all reschedule rules
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    RescheduleRule.find({}, function(err, rules) {
        if(err) throw err;
        console.log("Removing all reschedule rules from system.");
        console.log(rules.length + " reschedule rules were found and are pending delete.");
        for(var i = rules.length -1; i >= 0; i--) {
            rules[i].remove();
        }
        res.json("Successfully removed all reschedule rules.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:rescheduleRuleId')

///GET reschedule rule by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    RescheduleRule.findById(req.params.rescheduleRuleId)
        .exec(function(err, rule) {
            if(err) throw err;
            res.json(rule);
    });
})

//PUT update reschedule rule by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    RescheduleRule.findByIdAndUpdate(req.params.rescheduleRuleId, {$set: req.body}, {new: true}) 
        .exec(function(err, rule) {
            if(err) throw err;
            res.json(rule);
    });
})

///DELETE reschedule rule by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    RescheduleRule.findById(req.params.rescheduleRuleId)
        .exec(function(err, rule) {
            if(err) throw err;
            rule.remove();
            res.json("Successfully removed reschedule rule " + rule.name);
    });
});


module.exports = router;