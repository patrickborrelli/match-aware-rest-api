var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var Event = require('../models/event');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all events
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.find(req.query)
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, events) {
            if(err) return next(err);
            res.json(events);
    });
})

//POST add event
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    var startHour = req.body.start_time.slice(0,2);
    var startMinute = req.body.start_time.slice(2,4);
    var endHour = req.body.end_time.slice(0,2);
    var endMinute = req.body.end_time.slice(2,4);
    
    if(req.body.start == null) {
        req.body.start = new Date(req.body.date_year, req.body.date_month - 1, req.body.date_day, startHour, startMinute, 0, 0).getTime();
    } 
    
    if(req.body.end == null) {
        req.body.end = new Date(req.body.date_year, req.body.date_month - 1, req.body.date_day, endHour, endMinute, 0, 0).getTime();
    }
    
    //determine if event is in conflict before adding, and if so mark it as such:
    async.waterfall(
        [
            function(callback) {
                console.log("Attempting to find an event with start lte: " + req.body.start + 
                           " and end gt: " +req.body.start + " or with a start lt: " + req.body.end + 
                           " and end gte: " + req.body.end);
                Event.findOne({$or: [
                              { $and: [{start: {$lte: req.body.start}}, {end: {$gt: req.body.start}}] },
                              { $and: [{start: {$lt: req.body.end}}, {end: {$gte: req.body.end}}] }
                          ]})
                    .exec(function(err, conflictingEntry) {
                        if(err) return next(err);                        
                        callback(null, conflictingEntry);
                    });
                
            },
            function(conflictingEntry, callback) {
                if(conflictingEntry != null) {
                    req.body.status = "CONFLICTED";
                    req.body.conflicted_with = conflictingEntry._id;
                    console.log("Found a conflicting entry: " + conflictingEntry);
                } else {
                    console.log("No conflicting entry found: " + conflictingEntry);
                }
                Event.create(req.body, function(err, event) {
                    if(err) return next(err);
                    console.log("New event created");
                    callback(null, event);
                });                
            }
        ],
        function(err, event) {
            if(err) return next(err);        
            res.json(event);
        }
    )    
})

//DELETE all events
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.find({}, function(err, events) {
        if(err) return next(err);
        console.log("Removing all events from system.");
        console.log(events.length + " events were found and are pending delete.");
        for(var i = events.length -1; i >= 0; i--) {
            events[i].remove();
        }
        res.json("Successfully removed all events.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:eventId')

///GET event by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.findById(req.params.eventId)
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, event) {
            if(err) return next(err);
            res.json(event);
    });
})

//PUT update event by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    var startString;
    var startHour;
    var startMinute;
    var endString;
    var endHour;
    var endMinute;
    var dateYear;
    var dateMonth;
    var dateDay;
    var scheduleChange = false;
    var necessaryData = false;
    
    //determine if request changes any date/time information:
    if( (req.body.date_year ||
         req.body.date_month ||
         req.body.date_day ||
         req.body.start_time ||
         req.body.end_time) != null) {
        
        //this is a date/time change:
        scheduleChange = true;
    }
    
    if(scheduleChange) {
        //determine if event is in conflict before adding, and if so mark it as such:
        async.waterfall(
            [
                function(callback) {
                    //first get the current object by ID
                    Event.findById(req.params.eventId)
                        .populate('type')
                        .populate('home_team')
                        .populate('away_team')
                        .populate('league')
                        .populate('officials')
                        .populate('max_age_group')
                        .populate('min_age_group')
                        .populate('organization')
                        .populate('trainers')
                        .populate('field')
                        .populate('creator')
                        .populate('conflicted_with')
                        .exec(function(err, current) {
                            if(err) return next(err);    
                        
                            console.log("Current object retrieved: " + current);
                        
                            //populate either based on request or current record:
                            startString = (req.body.start_time || current.start_time);
                            endString = (req.body.end_time || current.end_time);
                            startHour = startString.slice(0,2);
                            startMinute = startString.slice(2,4);
                            endHour = endString.slice(0,2);
                            endMinute = endString.slice(2,4);
                            dateYear = (req.body.date_year || current.date_year);
                            dateMonth = ((req.body.date_month) || current.date_month);
                            dateDay = (req.body.date_day || current.date_day);
                        
                            req.body.start = new Date(dateYear, dateMonth-1, dateDay, startHour, startMinute, 0, 0).getTime();
                            req.body.end = new Date(dateYear, dateMonth-1, dateDay, endHour, endMinute, 0, 0).getTime();
                            callback(null, current);
                        });
                },
                function(current, callback) {
                    console.log("Attempting to find an event with start lte: " + req.body.start + 
                           " and end gt: " +req.body.start + " or with a start lt: " + req.body.end + 
                           " and end gte: " + req.body.end);
                    Event.findOne({$and: [
                                        {_id: { $ne: current._id }},
                                        {$or: [
                                            { $and: [{start: {$lte: req.body.start}}, {end: {$gt: req.body.start}}] },
                                            { $and: [{start: {$lt: req.body.end}}, {end: {$gte: req.body.end}}] }
                                        ]}
                                   ]}
                                  )
                        .exec(function(err, conflictingEntry) {
                            if(err) return next(err);                        
                            callback(null, conflictingEntry);
                        });          
                    
                },
                function(conflictingEntry, callback) {
                    if(conflictingEntry != null) {
                        req.body.status = "CONFLICTED";
                        req.body.conflicted_with = conflictingEntry._id;
                        console.log("Found a conflicting entry: " + conflictingEntry);
                    } else {
                        req.body.status = "PENDING";
                        req.body.conflicted_with = null;
                        console.log("No conflicting entry found: " + conflictingEntry);
                    }
                    Event.findByIdAndUpdate(req.params.eventId, {$set: req.body}, {new: true}) 
                        .exec(function(err, event) {
                            if(err) return next(err);
                            callback(null, event);                        
                    });
                }
            ],
            function(err, event) {
                if(err) return next(err);        
                res.json(event);
            }
        )
    } else {
        console.log("THERE IS NO SCHEDULE CHANGE");
        Event.findByIdAndUpdate(req.params.eventId, {$set: req.body}, {new: true}) 
            .exec(function(err, event) {
                if(err) return next(err);
                res.json(event);
        });
    }       
})

///DELETE event by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.findById(req.params.eventId)
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, event) {
            if(err) return next(err);
            event.remove();
            res.json("Successfully removed " + event.status + " " + event.type.name);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findByReferee/:userId')

///GET events for the provided referee by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.find({officials: req.params.userId})
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, events) {
            if(err) return next(err);
            res.json(events);
    });    
});


//#################################################################################################
//#################################################################################################
router.route('/findByStatus/:status')

///GET events for the provided referee by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.find({status: req.params.status})
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, events) {
            if(err) return next(err);
            res.json(events);
    });    
});

//#################################################################################################
//#################################################################################################
router.route('/findByTeam/:teamId')

///GET events for the provided referee by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.find({$or: [
                    {home_team: req.params.teamId},
                    {away_team: req.params.teamId}
              ]}
    )
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, events) {
            if(err) return next(err);
            res.json(events);
    });    
});


//#################################################################################################
//#################################################################################################
router.route('/findByTrainer/:userId')

///GET events for the provided referee by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Event.find({trainers: req.params.userId})
        .populate('type')
        .populate('home_team')
        .populate('away_team')
        .populate('league')
        .populate('officials')
        .populate('max_age_group')
        .populate('min_age_group')
        .populate('organization')
        .populate('trainers')
        .populate('field')
        .populate('creator')
        .populate('conflicted_with')
        .exec(function(err, events) {
            if(err) return next(err);
            res.json(events);
    });    
});

module.exports = router;