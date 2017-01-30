var express = require('express');
var bodyParser = require('body-parser');
var Rule = require('../models/rule');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all rules:
.get(function(req, res, next) {
    Rule.find(req.query)
        .populate('league')
        .populate('age_group')
        .exec(function(err, rules) {
            if(err) throw err;
            res.json(rules);
    });    
})

//add a new rule to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Rule.create(req.body, function(err, rule) {
        if(err) return next(err);
        console.log("New rule created");
        res.json(rule);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Rule.remove({}, function(err, rules) {
        if(err) return next(err);
        console.log("Removed: \n" + rules);
        res.json("All rules removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:ruleId')

///GET rule by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Rule.findById(req.params.ruleId)        
        .populate('league')
        .populate('age_group')
        .exec(function(err, rule) {
            if(err) throw err;
            res.json(rule);
    });
})

//PUT update rule by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Rule.findByIdAndUpdate(req.params.ruleId, {$set: req.body}, {new: true}) 
        .exec(function(err, rule) {
            if(err) throw err;
            res.json(rule);
    });
})

///DELETE rule by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    var ruleName;
    Rule.findById(req.params.ruleId)               
        .populate('league')
        .populate('age_group')
        .exec(function(err, rule) {
            if(err) throw err;
            if(rule != null) {
                ruleName = rule.league.short_name + "/" + rule.age_group.name;
                rule.remove();
                res.json("Successfully removed rule " + ruleName );
            } else {
                res.json("No rule found to delete.")
            }
            
    });
});

module.exports = router;