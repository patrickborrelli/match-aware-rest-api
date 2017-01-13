var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var FieldAvailability = require('../models/fieldAvailability');
var Event = require('../models/event');
var Field = require('../models/field');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all field availability:
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    FieldAvailability.find(req.query)
        .populate('field')
        .populate({
            path: 'field',
            populate: {
                path: 'facility',
                model: 'Facility'
            }
        })
        .exec(function(err, availabilities) {
            if(err) throw err;
            res.json(availabilities);
    });    
})

//post a field availability:
.post(Verify.verifyOrdinaryUser, function(req, res) {
    FieldAvailability.create(req.body, function(err, avail) {
        if(err) return next(err);
        console.log("New field availability created");
        res.json(avail);
    });
})

//delete all field availability:
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    FieldAvailability.find({}, function(err, avails) {
        if(err) return next(err);
        console.log("Removing all field availabilities from system.");
        console.log(avails.length + " field availabilities were found and are pending delete.");
        for(var i = avails.length -1; i >= 0; i--) {
            avails[i].remove();
        }
        res.json("Successfully removed all field availabilities.");        
    });  
});


//#################################################################################################
//#################################################################################################
router.route('/initializeForField/:fieldId')

.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    //1. get field and copy over booleans
    //2. for next 90 days starting today, build avail for field for day based on field facility hours
    async.waterfall(
        [
            function(callback) {
                Field.findById(req.params.fieldId)
                    .populate('facility')
                    .populate('size')
                    .exec(function(err, field) {
                        if(err) throw err;
                        callback(null, field.game, field.practice, field.tournament, field.facility.sun_start_time, field.facility.sun_stop_time,
                                field.facility.mon_start_time, field.facility.mon_stop_time, field.facility.tue_start_time, field.facility.tue_stop_time,
                                field.facility.wed_start_time,field.facility.wed_stop_time, field.facility.thu_start_time, field.facility.thu_stop_time,
                                field.facility.fri_start_time, field.facility.fri_stop_time, field.facility.sat_start_time, field.facility.sat_stop_time);
                });  
            },
            function(gm, prc, tourn, sunsta, sunsto, msta, msto, tsta, tsto, wsta, wsto, thsta, thsto, fsta, fsto, sasta, sasto, callback) {
                var now = new Date();
                var myStart;
                var myEnd;
                var myDur;
                var avail;
                var avails = [];
                //set up array of start times:
                var startHrs = [sunsta.slice(0,2), msta.slice(0,2), tsta.slice(0,2), wsta.slice(0,2), thsta.slice(0,2), fsta.slice(0,2), sasta.slice(0,2)];
                var startMin = [sunsta.slice(2,4), msta.slice(2,4), tsta.slice(2,4), wsta.slice(2,4), thsta.slice(2,4), fsta.slice(2,4), sasta.slice(2,4)];
                var endHrs = [sunsto.slice(0,2), msto.slice(0,2), tsto.slice(0,2), wsto.slice(0,2), thsto.slice(0,2), fsto.slice(0,2), sasto.slice(0,2)];
                var endMin = [sunsto.slice(2,4), msto.slice(2,4), tsto.slice(2,4), wsto.slice(2,4), thsto.slice(2,4), fsto.slice(2,4), sasto.slice(2,4)];
                
                for(var i = 1; i <= 90; i++) {
                    myStart = new Date(now.getFullYear(), now.getMonth()+1, now.getDate(), startHrs[now.getDay()], startMin[now.getDay()], 0, 0).getTime();
                    myEnd = new Date(now.getFullYear(), now.getMonth()+1, now.getDate(), endHrs[now.getDay()], endMin[now.getDay()], 0, 0).getTime();
                    myDur = myEnd - myStart;
                    avail = new FieldAvailability({ field: req.params.fieldId, start: myStart, end: myEnd, duration: myDur, game: gm, practice: prc, tournament: tourn});
                    avails.push(avail);
                    now.setDate(now.getDate() +1);
                }
                callback(null, avails);
            },
            function(avails, callback) {
                async.each(avails, function(avail, callback) {
                    avail.save(function (err) {
                        if(err) return next(err);
                    })
                }, function(err) {
                    if(err) return next(err);
                });
                callback(null);
            }
        ],
        function(err) {
            res.json("Finished populating field availability.");
        }
    )
    
});


//#################################################################################################
//#################################################################################################
router.route('/scheduleEvent/:eventId')

.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    //1. get event and retrieve start and end
    //2. find an availability that includes both the start and end time of the event and retrieve it
    //3. delete the existing availablity and create one or two new ones based on the added event
    async.waterfall(
        [
            function(callback) {
                Event.findById(req.params.eventId)
                    .exec(function(err, event) {
                        if(err) return next(err);
                        callback(null, event.start, event.end, event.field);
                });
            },
            function(eventStart, eventEnd, eventField, callback) {
                FieldAvailability.findOne(
                        { $and: [{start: {$lte: eventStart}}, {end: {$gte: eventEnd}}, {field: eventField}] }
                    )
                    .populate('field')
                    .populate({
                        path: 'field',
                        populate: {
                            path: 'facility',
                            model: 'Facility'
                        }
                    })
                    .exec(function(err, avail) {
                        if(err) return next(err);
                        callback(null, avail, eventStart, eventEnd);
                });
            },
            function(avail, eventStart, eventEnd, callback) {
                //now we either have an object, or could not find one.  If we found one, save its info and cut it in two:
                if(null != avail) {
                    var newAvails = [];
                    var newAvail;
                    
                    if(avail.start < eventStart) {
                        //create a new availability from the start of the current availability to the start of the event:
                        newAvail = new FieldAvailability({ field: avail.field._id, start: avail.start, end: eventStart, duration: (eventStart - avail.start), game: avail.game, practice: avail.practice, tournament: avail.tournament});
                        newAvails.push(newAvail);
                    }
                    
                    if(avail.end > eventEnd) {
                        //create a new availability from the end of the event to the end of the current availability:
                        newAvail = new FieldAvailability({ field: avail.field._id, start: eventEnd, end: avail.end, duration: (avail.end - eventEnd), game: avail.game, practice: avail.practice, tournament: avail.tournament});
                        newAvails.push(newAvail);
                    }
                    
                    //finally, delete the current availability:
                    avail.remove();
                    callback(null, newAvails);
                    
                } else {
                    res.json("No availabilty matches requirements of event.");
                }
            },
            function(avails, callback) {
                //lastly, simply save off the newly created availabilities:
                async.each(avails, function(avail, callback) {
                    avail.save(function (err) {
                        if(err) return next(err);
                    })
                }, function(err) {
                    if(err) return next(err);
                });
                callback(null);
            }
        ],
        function(err) {
            res.json("Finished scheduling event.");           
        }
    )
    
});

module.exports = router;