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
    FieldAvailability.find({})
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
    
    var startDate = new Date(req.body.start);
    var endDate = new Date(req.body.end);
    req.body.date_year = startDate.getFullYear();
    req.body.date_month = startDate.getMonth() +1;
    req.body.date_day = startDate.getDate();
    req.body.start_time = String( (("0" + startDate.getHours()).slice(-2)).concat((("0" + startDate.getMinutes()).slice(-2))) );
    req.body.end_time = String( (("0" + endDate.getHours()).slice(-2)).concat((("0" + endDate.getMinutes()).slice(-2))) );
    
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
router.route('/findByQuery')

//get all field availability:
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    /**
     * valid query parameters include: 
     *  fieldId         (ObjectId)              optional
     *  game            (boolean)               at least one of game | practice | training | tournament required
     *  practice        (boolean)               at least one of game | practice | training | tournament required
     *  training        (boolean)               at least one of game | practice | training | tournament required
     *  tournament      (boolean)               at least one of game | practice | training | tournament required
     *  specificDate    (yyyymmdd)              optional
     *  earliestDate    (yyyymmdd)              optional (if earliest is specified, latest is required and vice versa)
     *  latestDate      (yyyymmdd)              optional (see earliest)
     *  specificTime    (24 hour, 0000-2359)    optional
     *  earliestTime    (24 hour, 0000-2359)    optional (if earliest is specified, latest is required and vice versa)
     *  latestTime      (24 hour, 0000-2359)    optional (see earliest)
     *  duration        (minutes)               required
     */
    var err;
    var reqMissing = false;
    var optionalProblems = false;
    var errorString;
    var hasError = false;
        
    if((req.query.game || req.query.practice || req.query.training || req.query.tournament) == null) {
        errorString = "Required parameters missing: ";
        errorString += "[game | practice | training | tournament]";
        reqMissing = true;
        hasError = true;
    }
    
    if(req.query.duration == null) {
        if(!reqMissing) {
            errorString = "Required parameters missing: ";
            reqMissing = true;
            hasError = true;
            errorString += "duration";
        } else {
            errorString += ", duration";
        }
        
    }
    
    //now check optionals with dependencies:
    if(((req.query.earliestDate || req.query.latestDate) != null) &&
        ((req.query.earliestDate && req.query.latestDate) == null)) {
        //we have one, but not both:
        if(hasError) {
            errorString += "\n\nProblem with optional parameters: must provide earliestDate AND latestDate or neither";
            optionalProblems = true;
        } else {
            errorString = "Problem with optional parameters: must provide earliestDate AND latestDate or neither";
            optionalProblems = true;
            hasError = true;
        }
    }
    
    if(((req.query.earliestTime || req.query.latestTime) != null) &&
        ((req.query.earliestTime && req.query.latestTime) == null)) {
        //we have one, but not both:
        if(hasError && optionalProblems) {
            errorString += ", must provide earliestTime AND latestTime or neither";
        } else if(hasError && !optionalProblems) {
            errorString += "\n\nProblem with optional parameters: must provide earliestTime AND latestTime or neither";
            optionalProblems = true;
        } else {
            errorString = "Problem with optional parameters: must provide earliestTime AND latestTime or neither";
            hasError = true;
        }
    }
    
    if(hasError) {
        err = new Error(errorString);
        err.status = 400;
        return next(err);
    }    
    
    //now build query string:
    var queryString = {$and: []};
    var specificDateString;
    var earliestDateString;
    var lastestDateString;
    
    //first see if we are checking based on date:
    if(req.query.specificDate) {
        specificDateString = new Date(req.query.specificDate.slice(0,4), (req.query.specificDate.slice(4,6))-1, req.query.specificDate.slice(6,8), 0,1,0,0);
        if(req.query.earliestDate) {
            console.log("Received specific date, date range also provided will be ignored.");
        }
        queryString.$and.push({date_year: specificDateString.getFullYear()});
        queryString.$and.push({date_month: (specificDateString.getMonth() +1)});
        queryString.$and.push({date_day: specificDateString.getDate()});
        
    } else if(req.query.earliestDate && req.query.latestDate) {
        //we have both of these, so set them:
        earliestDateString = new Date(req.query.earliestDate.slice(0,4), (req.query.earliestDate.slice(4,6))-1, req.query.earliestDate.slice(6,8), 0,1,0,0);
        latestDateString = new Date(req.query.latestDate.slice(0,4), (req.query.latestDate.slice(4,6))-1, req.query.latestDate.slice(6,8), 0,1,0,0);
        
        queryString.$and.push({start: {$gte: earliestDateString.getTime()}});
        queryString.$and.push({end: {$gte: latestDateString.getTime()}});
    }     
    
    //next see if we are checking based on time:
    if(req.query.specificTime) {
        if(req.query.earliestTime) {
            console.log("Received specific time, time range also provided will be ignored.");
        }
        queryString.$and.push({start_time: {$lte: req.query.specificTime}});
        var hrs = parseInt(req.query.specificTime.slice(0,2));
        var min = parseInt(req.query.specificTime.slice(2,4));
        var dur = parseInt(req.query.duration);
        
        var newHrs = hrs + Math.floor(dur/60);
        var newMin = min + dur % 60;
        
        if(newMin >= 60) {
            newHrs++;
            newMin = newMin - 60;
        }
        
        newHrs = newHrs.toString();
        newMin = newMin.toString();
        newHrs = ("0" + newHrs).slice(-2);
        newMin = ("0" + newMin).slice(-2);
        
        var newEnd = newHrs + newMin;
        console.log("New end = " + newEnd);        
        
        queryString.$and.push({end_time: {$gte: newEnd}});
    } else if(req.query.earliestTime && req.query.latestTime) {
        queryString += "'start': {$lte: " + req.query.earliestTime + " }, 'end': {$gte: " + req.query.latestTime + "},";
    }     
    
    if(req.query.fieldId) {
        queryString.$and.push({field: req.query.fieldId});
    }    
    if(req.query.game) {
        queryString.$and.push({game: req.query.game});
    }
    if(req.query.practice) {
        queryString.$and.push({practice: req.query.practice});
    }
    if(req.query.training) {
        queryString.$and.push({training: req.query.training});
    }
    if(req.query.tournament) {
        queryString.$and.push({tournament: req.query.tournament});
    }
    var quDur = req.query.duration * 60 * 1000;
    queryString.$and.push({duration: {$gte: quDur}});
    
    console.log("Query string used is : " + JSON.stringify(queryString));
    
    
    FieldAvailability.find(queryString)
        .populate('field')
        .populate({
            path: 'field',
            populate: {
                path: 'facility',
                model: 'Facility'
            }
        })
        .exec(function(err, availabilities) {
            if(err) return next(err);
            res.json(availabilities);
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
                        callback(null, field.game, field.practice, field.tournament, field.training, field.facility.sun_start_time, field.facility.sun_stop_time,
                                field.facility.mon_start_time, field.facility.mon_stop_time, field.facility.tue_start_time, field.facility.tue_stop_time,
                                field.facility.wed_start_time,field.facility.wed_stop_time, field.facility.thu_start_time, field.facility.thu_stop_time,
                                field.facility.fri_start_time, field.facility.fri_stop_time, field.facility.sat_start_time, field.facility.sat_stop_time);
                });  
            },
            function(gm, prc, tourn, train, sunsta, sunsto, msta, msto, tsta, tsto, wsta, wsto, thsta, thsto, fsta, fsto, sasta, sasto, callback) {
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
                    myStart = new Date(now.getFullYear(), now.getMonth()+1, now.getDate(), startHrs[now.getDay()], startMin[now.getDay()], 0, 0);
                    myEnd = new Date(now.getFullYear(), now.getMonth()+1, now.getDate(), endHrs[now.getDay()], endMin[now.getDay()], 0, 0);
                    myDur = myEnd - myStart;
                    
                    avail = new FieldAvailability({ field: req.params.fieldId, start: myStart.getTime(), end: myEnd.getTime(), duration: myDur, game: gm, practice: prc, tournament: tourn,
                                                  training: train, date_year: myStart.getFullYear(), date_month: (myStart.getMonth()), date_day: myStart.getDate(), 
                                                  start_time: (String( (("0" + myStart.getHours()).slice(-2)).concat((("0" + myStart.getMinutes()).slice(-2))) )),
                                                  end_time: (String( (("0" + myEnd.getHours()).slice(-2)).concat((("0" + myEnd.getMinutes()).slice(-2))) ))});
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
                        newAvail = new FieldAvailability({ field: avail.field._id, start: avail.start, end: eventStart, duration: (eventStart - avail.start), game: avail.game, practice: avail.practice, tournament: avail.tournament, training: avail.training});
                        newAvails.push(newAvail);
                    }
                    
                    if(avail.end > eventEnd) {
                        //create a new availability from the end of the event to the end of the current availability:
                        newAvail = new FieldAvailability({ field: avail.field._id, start: eventEnd, end: avail.end, duration: (avail.end - eventEnd), game: avail.game, practice: avail.practice, tournament: avail.tournament, training: avail.training});
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