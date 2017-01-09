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
.get(function(req, res) {
    Role.find({})
        .populate('created_by')
        .exec(function(err, roles) {
            if(err) throw err;
            res.json(roles);
    });    
})

//add a new role to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    req.body.created_by = req.decoded._id;
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

module.exports = router;