var express = require('express');
var bodyParser = require('body-parser');
var Message = require('../models/message');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all messages:
.get(function(req, res, next) {
    Message.find(req.query)
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .exec(function(err, messages) {
            if(err) throw err;
            res.json(messages);
    });    
})

//add a new message to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.sender = req.decoded._id;
    console.log("Created date is " + req.body.created_date);
    Message.create(req.body, function(err, message) {
        if(err) return next(err);
        console.log("New message created");
        res.json(message);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Message.remove({}, function(err, messages) {
        if(err) return next(err);
        console.log("Removed: \n" + messages);
        res.json("All messages removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:messageId')

///GET message by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Message.findById(req.params.messageId)
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .exec(function(err, message) {
            if(err) throw err;
            res.json(message);
    });
})

//PUT update message by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Message.findByIdAndUpdate(req.params.messageId, {$set: req.body}, {new: true}) 
        .exec(function(err, message) {
            if(err) throw err;
            res.json(message);
    });
})

///DELETE message by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Message.findById(req.params.messageId)
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .exec(function(err, message) {
            if(err) throw err;
            message.remove();
            res.json("Successfully removed message from " + message.sender.getFullName() + " with content " + message.text);
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findByEvent/:eventId')

///GET all messages for an event by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Message.find({event: req.params.eventId})
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .exec(function(err, message) {
            if(err) throw err;
            res.json(message);
    });
});


//#################################################################################################
//#################################################################################################
router.route('/findByRecipient/:userId')

///GET all messages for a user by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Message.find({recipient: req.params.userId})
        .populate('event')
        .populate('sender')
        .populate('recipient')
        .exec(function(err, message) {
            if(err) throw err;
            res.json(message);
    });
});

module.exports = router;