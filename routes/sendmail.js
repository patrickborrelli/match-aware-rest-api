var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify');
var config = require('../config');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var router = express.Router();
router.use(bodyParser.json());

//#################################################################################################
//#################################################################################################
router.route('/')

//add a new field to the system:  
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    var auth = {
        auth: {
            api_key: config.mailApiKey,
            domain: 'mg.matchaware.com'
        }        
    }
    
    var transport = nodemailer.createTransport(mg(auth));
    
    transport.sendMail({
        from: 'postmaster@matchaware.com',
        to: 'patrickborrelli@gmail.com',
        subject: 'Second Email from MatchAware',
        html: '<p><h1>Welcome to MatchAware</h1><br><p>Please come to the website to begin your journey.</p>'
    }, function(err, info) {
        if(err) return next(err);
        console.log("Response: " + info);
        res.json("Response: " + info);
    });
    
});

module.exports = router;