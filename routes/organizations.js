var express = require('express');
var bodyParser = require('body-parser');
var Organization = require('../models/organization');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all organizations
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.find(req.query)
        .populate('administrator')
        .populate('club_affiliation')
        .populate('staff')
        .exec(function(err, organizations) {
            if(err) return next(err);
            res.json(organizations);
    });
})

//POST add organization
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.create(req.body, function(err, organization) {
        if(err) return next(err);
        console.log("New organization created");
        res.json(organization);
    });
})

//DELETE all organizations
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.find({}, function(err, organizations) {
        if(err) return next(err);
        console.log("Removing all organizations from system.");
        console.log(organizations.length + " organizations were found and are pending delete.");
        for(var i = organizations.length -1; i >= 0; i--) {
            organizations[i].remove();
        }
        res.json("Successfully removed all organizations.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:organizationId')

///GET organization by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.findById(req.params.organizationId)
        .populate('administrator')
        .populate('club_affiliation')
        .populate('staff')
        .exec(function(err, organization) {
            if(err) return next(err);
            res.json(organization);
    });
})

//PUT update organization by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.findByIdAndUpdate(req.params.organizationId, {$set: req.body}, {new: true}) 
        .exec(function(err, organization) {
            if(err) return next(err);
            res.json(organization);
    });
})

///DELETE organization by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.findById(req.params.organizationId)
        .exec(function(err, organization) {
            if(err) return next(err);
            organization.remove();
            res.json("Successfully removed " + organization.name);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findByClub/:clubId')

///GET all organizations working for a club by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Organization.find({club_affiliation: req.params.clubId})
        .populate('administrator')
        .populate('club_affiliation')
        .populate('staff')
        .exec(function(err, organization) {
            if(err) return next(err);
            res.json(organization);
    });
});


module.exports = router;