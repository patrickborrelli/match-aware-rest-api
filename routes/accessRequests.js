var express = require('express');
var bodyParser = require('body-parser');
var AccessRequest = require('../models/accessRequest');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all access requests:
.get(function(req, res) {
    AccessRequest.find(req.query)
        .populate('user')
        .populate('club')
        .populate('role')
        .populate('team')
        .populate('approver')
        .exec(function(err, accessRequests) {
            if(err) throw err;
            res.json(accessRequests);
    });    
})

//add a new access request to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    AccessRequest.create(req.body, function(err, accessRequest) {
        if(err) return next(err);
        console.log("New access request created");
        res.json(accessRequest);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    AccessRequest.remove({}, function(err, accessRequests) {
        if(err) return next(err);
        console.log("Removed: \n" + accessRequests);
        res.json("All access requests removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:accessRequestId')

///GET access request by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    AccessRequest.findById(req.params.accessRequestId)        
        .populate('user')
        .populate('club')
        .populate('role')
        .populate('team')
        .populate('owner')
        .exec(function(err, accessRequest) {
            if(err) throw err;
            res.json(accessRequest);
    });
})

//PUT update access request by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    AccessRequest.findByIdAndUpdate(req.params.accessRequestId, {$set: req.body}, {new: true}) 
        .exec(function(err, accessRequest) {
            if(err) throw err;
            res.json(accessRequest);
    });
})

///DELETE access request by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    var accessRequestName;
    AccessRequest.findById(req.params.accessRequestId)               
        .populate('user')
        .populate('club')
        .populate('role')
        .populate('team')
        .populate('approver')
        .exec(function(err, accessRequest) {
            if(err) throw err;
            if(accessRequest != null) {
                accessRequestName = accessRequest.user.getFullName() + "/" + accessRequest.club.name + "/" + accessRequest.role.name; 
                if(accessRequest.team != null) {
                    accessRequestName = accessRequestName + "/" + accessRequest.team.name;
                }
                accessRequest.remove();
                res.json("Successfully removed access request " + accessRequestName );
            } else {
                res.json("No access request found to delete.")
            }
            
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findByApprover/:userId')

///GET all access requests pending review by this user
.get(Verify.verifyOrdinaryUser, function(req, res) {
    AccessRequest.find({$and: 
                            [
                                  { $or: [{status: "PENDING"}, {status: "SENT"}] },
                                  { approver: req.params.userId }
                            ]
                       })      
        .populate('user')
        .populate('club')
        .populate('role')
        .populate('team')
        .populate('approver')
        .exec(function(err, accessRequests) {
            if(err) throw err;
            res.json(accessRequests);
    });
        
});

//#################################################################################################
//#################################################################################################
router.route('/findByStatus/:status')

///GET all access requests with the provided status
.get(Verify.verifyOrdinaryUser, function(req, res) {
    AccessRequest.find({status: req.params.status})        
        .populate('user')
        .populate('club')
        .populate('role')
        .populate('team')
        .populate('approver')
        .exec(function(err, accessRequests) {
            if(err) throw err;
            res.json(accessRequests);
    });
});

module.exports = router;