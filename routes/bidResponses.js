var express = require('express');
var bodyParser = require('body-parser');
var BidResponse = require('../models/bidResponse');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all bid responses
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidResponse.find(req.query)
        .populate('events')
        .populate('message')        
        .populate('campaign')
        .exec(function(err, responses) {
            if(err) throw err;
            res.json(responses);
    });
})

//POST add bid response
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidResponse.create(req.body, function(err, bidResponse) {
        if(err) return next(err);
        console.log("New bid response created");
        res.json(bidResponse);
    });
})

//DELETE all bid campaigns
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidResponse.find({}, function(err, bidResponses) {
        if(err) return next(err);
        console.log("Removing all bid responses from system.");
        console.log(bidResponses.length + " responses were found and are pending delete.");
        for(var i = bidResponses.length -1; i >= 0; i--) {
            bidResponses[i].remove();
        }
        res.json("Successfully removed all bid responses.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findAllByCampaign/:campaignId')

///GET bid responses by campaign ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidResponse.find({campaign: req.params.campaignId})
        .populate('events')
        .populate('message')        
        .populate('campaign')
        .exec(function(err, responses) {
            if(err) throw err;
            res.json(responses);
    });
})

///DELETE bid responses by campaign ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidResponse.find({campaign: req.params.campaignId}, function(err, bidResponses) {
        if(err) return next(err);
        console.log("Removing all bid responses for campaign " + req.params.campaignId + " from system.");
        console.log(bidResponses.length + " responses were found and are pending delete.");
        for(var i = bidResponses.length -1; i >= 0; i--) {
            bidResponses[i].remove();
        }
        res.json("Successfully removed all bid responsesfor campaign " + req.params.campaignId + ".");
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findByCampaignAndStatus/:campaignId/:status')

///GET bid responses by campaign ID and status
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    BidResponse.find({campaign: req.params.campaignId, status: req.params.status})
        .populate('events')
        .populate('message')        
        .populate('campaign')
        .exec(function(err, responses) {
            if(err) throw err;
            res.json(responses);
    });
});


module.exports = router;