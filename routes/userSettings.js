var express = require('express');
var bodyParser = require('body-parser');
var UserSetting = require('../models/userSetting');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//GET all user settings
.get(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.find(req.query)
        .populate('user')
        .exec(function(err, settings) {
            if(err) throw err;
            res.json(settings);
    });
})

//POST add user settings
.post(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.create(req.body, function(err, setting) {
        if(err) return next(err);
        console.log("New user setting created");
        res.json(setting);
    });
})

//DELETE all user settings
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.find({}, function(err, settings) {
        if(err) return next(err);
        console.log("Removing all user settings from system.");
        console.log(settings.length + " user settings were found and are pending delete.");
        for(var i = settings.length -1; i >= 0; i--) {
            settings[i].remove();
        }
        res.json("Successfully removed all user settings.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:userSettingId')

///GET user setting by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.findById(req.params.userSettingId)
        .populate('user')    
        .exec(function(err, setting) {
            if(err) throw err;
            res.json(setting);
    });
})

//PUT update user setting by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.findByIdAndUpdate(req.params.userSettingId, {$set: req.body}, {new: true}) 
        .exec(function(err, setting) {
            if(err) throw err;
            res.json(setting);
    });
})

///DELETE user setting by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.findById(req.params.userSettingId)
        .populate('user')
        .exec(function(err, setting) {
            if(err) throw err;
            setting.remove();
            res.json("Successfully removed user setting for " + setting.user.getFullName());
    });
});

//#################################################################################################
//#################################################################################################
router.route('/findByUser/:userId')

///GET user setting by user ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    UserSetting.find({user: req.params.userId})
        .populate('user')
        .exec(function(err, setting) {
            if(err) throw err;
            res.json(setting);
    });
});


module.exports = router;