var express = require('express');
var bodyParser = require('body-parser');
var Notification = require('../models/notification');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all notifications:
.get(function(req, res, next) {
    Notification.find(req.query)
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .populate('campaign')
        .populate('team_recipient')
        .exec(function(err, notifications) {
            if(err) throw err;
            res.json(notifications);
    });    
})

//add a new notification to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.sender = req.decoded._id;
    console.log("Sender is " + req.body.sender);
    Notification.create(req.body, function(err, notification) {
        if(err) return next(err);
        console.log("New notification created");
        res.json(notification);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Notification.remove(req.query, function(err, notifications) {
        if(err) return next(err);
        console.log("Removed: \n" + notifications);
        res.json("All notifications removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:notificationId')

///GET notification by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Notification.findById(req.params.notificationId)
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .populate('campaign')
        .populate('team_recipient')
        .exec(function(err, notification) {
            if(err) throw err;
            res.json(notification);
    });
})

//PUT update notification by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Notification.findByIdAndUpdate(req.params.notificationId, {$set: req.body}, {new: true}) 
        .exec(function(err, notification) {
            if(err) throw err;
            res.json(notification);
    });
})

///DELETE notification by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Notification.findById(req.params.notificationId)
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .populate('campaign')
        .populate('team_recipient')
        .exec(function(err, notification) {
            if(err) throw err;
            notification.remove();
            res.json("Successfully removed notification from " + notification.sender.getFullName() + " with content " + notification.text);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findByRecipient/:userId')

///GET all notifications for a user by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Notification.find({recipient: req.params.userId})
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .populate('campaign')
        .populate('team_recipient')
        .exec(function(err, notification) {
            if(err) throw err;
            res.json(notification);
    });
});


module.exports = router;