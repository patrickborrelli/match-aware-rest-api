var express = require('express');
var bodyParser = require('body-parser');
var Role = require('../models/role');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//get all roles:
.get(function(req, res, next) {
    Role.find(req.query)
        .sort({ name: 'asc' })
        .populate('created_by')
        .exec(function(err, roles) {
            if(err) throw err;
            res.json(roles);
    });    
})

//add a new role to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    console.log("Decoded id = " + req.decoded._id);
    req.body.created_by = req.decoded._id;
    console.log("Retrieved req.body.created_by: " + req.body.created_by);
    Role.create(req.body, function(err, role) {
        if(err) return next(err);
        console.log("New role created");
        res.json(role);
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Role.remove({}, function(err, roles) {
        if(err) return next(err);
        console.log("Removed: \n" + roles);
        res.json("All roles removed.");
    });
});

//#################################################################################################
//#################################################################################################
router.route('/:roleId')

///GET role by ID
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Role.findById(req.params.roleId)
        .exec(function(err, role) {
            if(err) throw err;
            res.json(role);
    });
})

//PUT update role by ID
.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Role.findByIdAndUpdate(req.params.roleId, {$set: req.body}, {new: true}) 
        .exec(function(err, role) {
            if(err) throw err;
            res.json(role);
    });
})

///DELETE role by ID
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Role.findById(req.params.roleId)
        .exec(function(err, role) {
            if(err) throw err;
            role.remove();
            res.json("Successfully removed role " + role.name);
    });
});

module.exports = router;