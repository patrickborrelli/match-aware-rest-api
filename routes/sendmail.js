var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify');
var config = require('../config');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');


exports.sendInviteEmail = function(req, res, next) {
    var auth = {
        auth: {
            api_key: config.mailApiKey,
            domain: 'mg.matchaware.com'
        }        
    }
    
    var transport = nodemailer.createTransport(mg(auth));
    
    transport.sendMail({
        from: 'postmaster@matchaware.com',
        to: req.body.sendToEmail,
        subject: 'Invite to MatchAware',
        html: req.body.emailHtml,
        text: req.body.emailText
    }, function(err, info) {
        if(err) return next(err);
        console.log("Response: " + info);
        req.body.emailResponse = JSON.stringify(info);
        next();
    });
};