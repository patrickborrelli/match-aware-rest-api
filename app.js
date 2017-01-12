var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

var authenticate = require('./authenticate');
var config = require('./config');

//Connect to Mongo database:
mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    //connected:
    console.log("Successfully connected to Mongo server.");
});

//set up routers:
var routes = require('./routes/index');
var users = require('./routes/users');
var roles = require('./routes/roles');
var clubs = require('./routes/clubs');
var club_members = require('./routes/clubMembers');
var age_groups = require('./routes/ageGroups');
var event_types = require('./routes/eventTypes');
var field_sizes = require('./routes/fieldSizes');
var league_types = require('./routes/leagueTypes');
var reschedule_rules = require('./routes/rescheduleRules');
var leagues = require('./routes/leagues');
var rules = require('./routes/rules');
var genders = require('./routes/genders');
var teams = require('./routes/teams');
var team_coaches = require('./routes/teamCoaches');
var team_players = require('./routes/teamPlayers');
var access_requests = require('./routes/accessRequests');
var facilities = require('./routes/facilities');
var fields = require('./routes/fields');
var league_teams = require('./routes/leagueTeams');
var user_invites = require('./routes/userInvites');
var user_settings = require('./routes/userSettings');
var organizations = require('./routes/organizations');
var events = require('./routes/events');
var change_requests = require('./routes/changeRequests');
var messages = require('./routes/messages');
var notifications = require('./routes/notifications');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "x-access-token, Content-Type");
    next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//passport config:
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/roles', roles);
app.use('/clubs', clubs);
app.use('/club_members', club_members);
app.use('/age_groups', age_groups);
app.use('/event_types', event_types);
app.use('/field_sizes', field_sizes);
app.use('/league_types', league_types);
app.use('/reschedule_rules', reschedule_rules);
app.use('/leagues', leagues);
app.use('/rules', rules);
app.use('/genders', genders);
app.use('/teams', teams);
app.use('/team_coaches', team_coaches);
app.use('/team_players', team_players);
app.use('/access_requests', access_requests);
app.use('/facilities', facilities);
app.use('/fields', fields);
app.use('/league_teams', league_teams);
app.use('/user_invites', user_invites);
app.use('/user_settings', user_settings);
app.use('/organizations', organizations);
app.use('/events', events);
app.use('/change_requests', change_requests);
app.use('/messages', messages);
app.use('/notifications', notifications);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
