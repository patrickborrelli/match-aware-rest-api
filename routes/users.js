var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

/**
    TO BE REINSTATED AT A LATER DATE
    
router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){});

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    } 
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});
*/

/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res) {
    User.find({}, function(err, users) {
        if(err) throw err;
        res.json(users);
    });
});

router.post('/register', function(req, res) {
    User.register(new User(
        { 
            username : req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            websiteUrl: req.body.websiteUrl,
            imageFile: req.body.imageFile,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            postalCode: req.body.postalCode,
            profileBrief: req.body.profileBrief,
            profile: req.body.profile
        }
    ),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if(req.body.firstName) {
            user.firstName = req.body.firstName;
        }
        if(req.body.lastName) {
            user.lastName = req.body.lastName;
        }
        user.save(function(err, user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json(user);
            });
        });        
    });
});

router.put('/:userId', Verify.verifyOrdinaryUser, function(req, res, next) {
    var owner = req.params.userId;
    var admin = req.decoded.admin;
    console.log("Found owner: " + owner);
    console.log("Found user: " + req.decoded._id);
    if(!admin && (owner != req.decoded._id)) {
        var err = new Error('You are not authorized to perform this operation.');
        err.status = 403;
        return next(err);
    }
    if(!admin && (req.body.admin != undefined)) {
        var err = new Error('Only administrators may change user admin status');
        err.status = 403;
        return next(err);
    }
    User.findByIdAndUpdate(req.params.userId, {$set: req.body}, {new: true}, function(err, user) {
        if(err) throw err;
        res.json(user);
    });
});

router.get('/:userId', Verify.verifyOrdinaryUser, function(req, res, next) {
    var editUser = req.params.userId;
    var admin = req.decoded.admin;
    console.log("Found owner: " + editUser);
    console.log("Found user: " + req.decoded._id);
    if(!admin && (editUser != req.decoded._id)) {
        var err = new Error('You are not authorized to perform this operation.');
        err.status = 403;
        return next(err);
    }
    User.findById(req.params.userId, function(err, user) {  
        if(null != user) {
            if(err) throw err;
            res.status(200).json(user);
        } else {
            res.status(200).json({status: 'No matching user found.'});
        }
    });
    
});


router.delete('/:userId', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    User.findById(req.params.userId, function(err, user) { 
        if(null != user) {
            if(err) throw err;
            user.remove();
            res.status(200).json({status: 'Successfully removed user.'});
        } else {
            res.status(200).json({status: 'No matching user found.'});
        }
    });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        
      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    }); 
  })(req,res,next);
});

router.post('/logout', function(req, res) {
    console.log("attempting to log out");
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

module.exports = router;