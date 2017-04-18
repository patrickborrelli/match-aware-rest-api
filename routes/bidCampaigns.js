var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var BidCampaign = require('../models/bidCampaign');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all bid campaigns
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidCampaign.find(req.query)
        .exec(function(err, campaigns) {
            if(err) throw err;
            res.json(campaigns);
    });
})

//POST add bid campaigns
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidCampaign.create(req.body, function(err, campaign) {
        if(err) return next(err);
        console.log("New bid campaign created");
        res.json(campaign);
    });
})

//DELETE all bid campaigns
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidCampaign.find({}, function(err, campaigns) {
        if(err) return next(err);
        console.log("Removing all bid campaigns from system.");
        console.log(campaigns.length + " campaigns were found and are pending delete.");
        for(var i = campaigns.length -1; i >= 0; i--) {
            campaigns[i].remove();
        }
        res.json("Successfully removed all bid campaigns.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:campaignId')

///GET bid campaign by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidCampaign.findById(req.params.campaignId)
        .exec(function(err, campaign) {
            if(err) throw err;
            res.json(campaign);
    });
})

//PUT update bid campaign by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidCampaign.findByIdAndUpdate(req.params.campaignId, {$set: req.body}, {new: true}) 
        .exec(function(err, campaign) {
            if(err) throw err;
            res.json(campaign);
    });
})

///DELETE closure by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidCampaign.findById(req.params.campaignId)
        .exec(function(err, campaign) {
            if(err) throw err;
            campaign.remove();
            res.json("Successfully removed " + campaign);
    });
});


module.exports = router;