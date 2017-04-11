var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Certification = require('../models/certification');
var License = require('../models/license');
var Organization = require('../models/organization');
var ClubRole = require('../models/clubRole');
var Role = require('../models/role');
var Club = require('../models/club');
var TeamMember = require('../models/teamMember');
var UserSetting = require('../models/userSetting');
var deepPopulate = require('mongoose-deep-populate');
var async = require('async');
var Verify = require('./verify');


//#################################################################################################
//#################################################################################################
router.route('/')

//GET all users
.get(Verify.verifyOrdinaryUser, function(req, res) {
    User.find(req.query)
        .sort({ last_name: 'asc' })
        .populate('certifications')
        .populate('licenses')
        .deepPopulate('roles.role roles.club')     
        .exec(function(err, users) {
            if(err) throw err;
            res.json(users);
    });
})

//DELETE all users
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    User.find({}, function(err, users) {
        if(err) return next(err);
        console.log("Removing all users from system.");
        console.log(users.length + " users were found and are pending delete.");
        for(var i = users.length -1; i >= 0; i--) {
            users[i].remove();
        }
        res.json("Successfully removed all users.");        
    });
});


//#################################################################################################
//#################################################################################################
router.route('/:userId')

///GET user by ID
.get(Verify.verifyOrdinaryUser, function(req, res) {
    User.findById(req.params.userId)
        .populate('certifications')
        .populate('licenses')
        .deepPopulate('roles.role roles.club') 
        .exec(function(err, user) {
            if(err) throw err;
            res.json(user);
    });
})

//PUT update user by ID
.put(Verify.verifyOrdinaryUser, function(req, res) {
    User.findByIdAndUpdate(req.params.userId, {$set: req.body}, {new: true})
        .populate('certifications')
        .populate('licenses')
        .deepPopulate('roles.role roles.club') 
        .exec(function(err, user) {
            if(err) throw err;
            res.json(user);
    });
})

///DELETE user by ID
.delete(Verify.verifyOrdinaryUser, function(req, res) {
    User.findById(req.params.userId)
        .exec(function(err, user) {
            if(err) throw err;
            var full = user.getFullName();
            user.remove();
            res.json("Successfully removed " + full);
    });
});

//#################################################################################################
//#################################################################################################
router.route('/deactivate/:userId')

///PUT update user to inactivate account
.put(Verify.verifyOrdinaryUser, function(req, res) {
    async.waterfall(
        [
            function(callback) {
                User.findById(req.params.userId)
                    .populate({ 
                         path: 'staff',
                         model: 'User',
                         populate: {
                           path: 'certifications',
                           model: 'Certification'
                         }, 
                         populate: {
                           path: 'licenses',
                           model: 'License'
                         }
                      })
                    .exec(function(err, user) {
                        if(err) throw err;
                        callback(null, user);
                    });                
            },
            function(user, callback) {
                //remove all club roles for this user:
                ClubRole.find({member: user._id}, function(err, roles) {
                    if(err) return next(err);
                    console.log("Removing all club roles for user " + user.getFullName());
                    console.log(roles.length + " club roles were found and are pending delete.");
                    for(var i = roles.length -1; i >= 0; i--) {
                        roles[i].remove();
                    }
                    callback(null, user);        
                });
            }, 
            function(user, callback) {
                //remove all team memberships:
                TeamMember.find({member: user._id}, function(err, teamMembers) {
                    if(err) return next(err);                    
                    console.log(teamMembers.length + " team memberships were found and are pending delete.");
                    for(var i = teamMembers.length -1; i >= 0; i--) {
                        teamMembers[i].remove();
                    }
                    console.log("All team memberships removed for user " + user.getFullName());                    
                    callback(null, user);
                });
            }, 
            function(user, callback) {
                //remove user settings:
                UserSetting.findOne({user: user._id}, function(err, setting) {
                    if(err) throw err;
                    if(setting != null) {
                        setting.remove();
                        console.log("Successfully removed user settings for " + user.getFullName());                    
                        callback(null, user);
                    } else {
                        console.log("No user settings for user " + user.getFullName());                    
                        callback(null, user);
                    }                    
                });
            }, 
            function(user, callback) {
                //handle organizations:
                //TODO: handle removing a user who is an organizational admkinistrator;
                callback(null, user);
            }, 
            function(user, callback) {
                //finally, mark user as inactive, save the user and return.
                user.roles = [];
                user.active = false;
                user.save(function(err, savedUser){
                    if(err) return next(err);
                    console.log("Successfully updated user " + user.getFullName());
                    callback(null, savedUser);
                });
                
            }
        ],
        function(err, user) {
            if(err) return next(err);
            res.json(user);
        }
    )   
    
});


//#################################################################################################
//#################################################################################################
router.route('/findByOrganization/:organizationId')

///GET users working for a training organization
.get(Verify.verifyOrdinaryUser, function(req, res) {
    Organization.findById(req.params.organizationId)
        .populate({ 
             path: 'staff',
             model: 'User',
             populate: {
               path: 'certifications',
               model: 'Certification'
             }, 
             populate: {
               path: 'licenses',
               model: 'License'
             }
          })
        .exec(function(err, organization) {
            if(err) throw err;
            res.json(organization.staff);
    });
})


//#################################################################################################
//#################################################################################################
router.post('/register', function(req, res) {
    User.register(new User(
        { 
            username : req.body.username,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email_address: req.body.email_address,
            mobile: req.body.mobile,
            profile_image_url: req.body.profile_image_url,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            postalCode: req.body.postalCode,
            certifications: req.body.certifications,
            licenses: req.body.licenses
        }
    ),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if(req.body.first_name) {
            user.first_name = req.body.first_name;
        }
        if(req.body.last_name) {
            user.last_name = req.body.last_name;
        }
        user.save(function(err, user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json(user);
            });
        });        
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
        fullname: user.getFullName(),
        token: token,
        userId: user._id
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