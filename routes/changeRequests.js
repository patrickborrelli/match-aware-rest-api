var express = require('express');
var bodyParser = require('body-parser');
var ChangeRequest = require('../models/changeRequest');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all change requests:
.get(function(req, res, next) {
    ChangeRequest.find(req.query)
        .populate('original_event')
        .populate('changed_event')
        .populate('approver')
        .populate('submitter')
        .populate('messages')
        .exec(function(err, changeRequests) {
            if(err) throw err;
            res.json(changeRequests);
    });    
})

//add a new change request to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.submitter = req.decoded._id;
    ChangeRequest.create(req.body, function(err, changeRequest) {
        if(err) return next(err);
        console.log("New change request created");
        res.json(changeRequest);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    ChangeRequest.remove({}, function(err, changeRequests) {
        if(err) return next(err);
        console.log("Removed: \n" + changeRequests);
        res.json("All change requests removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:changeRequestId')

///GET change request by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    ChangeRequest.findById(req.params.changeRequestId)
        .populate('original_event')
        .populate('changed_event')
        .populate('approver')
        .populate('submitter')
        .populate('messages')
        .exec(function(err, changeRequest) {
            if(err) throw err;
            res.json(changeRequest);
    });
})

//PUT update change request by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    ChangeRequest.findByIdAndUpdate(req.params.changeRequestId, {$set: req.body}, {new: true}) 
        .exec(function(err, changeRequest) {
            if(err) throw err;
            res.json(changeRequest);
    });
})

///DELETE change request by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    ChangeRequest.findById(req.params.changeRequestId)
        .exec(function(err, changeRequest) {
            if(err) throw err;
            changeRequest.remove();
            res.json("Successfully removed change request.");
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findByApprover/:userId')

///GET change request by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    ChangeRequest.find({approver: req.params.userId})
        .populate('original_event')
        .populate('changed_event')
        .populate('approver')
        .populate('submitter')
        .populate('messages')
        .exec(function(err, changeRequests) {
            if(err) throw err;
            res.json(changeRequests);
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findBySubmitter/:userId')

///GET change request by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    ChangeRequest.find({submitter: req.params.userId})
        .populate('original_event')
        .populate('changed_event')
        .populate('approver')
        .populate('submitter')
        .populate('messages')
        .exec(function(err, changeRequests) {
            if(err) throw err;
            res.json(changeRequests);
    });
});

module.exports = router;