var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var League = require('./league.js');
var Team = require('./team.js');
var AgeGroup = require('./ageGroup.js');
var EventType = require('./eventType.js');
var Organization = require('./organization.js');
var Field = require('./field.js');

var Event = new Schema({
    name: String,
    type: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'EventType'
    },
    replaces: this,
    away_team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    home_team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    league: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    officials: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    max_age_group: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    min_age_group: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },
    trainers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    date_year: {
        type: String,
        required: true
    },
    date_month:  {
        type: String,
        required: true
    },
    date_day:  {
        type: String,
        required: true
    },
    start: Number,
    end: Number,
    start_time:  {
        type: String,
        required: true
    },
    end_time:  {
        type: String,
        required: true
    },
    field: {
        type: Schema.Types.ObjectId,
        ref: 'Field'
    },
    recurring: Boolean,
    status: {
        type: String,
        enum: ['PROPOSED', 'PENDING', 'CONFLICTED', 'SCHEDULED_PENDING_ASSIGNMENT', 'SCHEDULED', 'COMPLETED', 'PENDING_RESCHEDULE', 'PENDING_CHANGE_REQUEST']
    },
    conflicted_with: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    weekday: {
        type: String,
        enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', Event);
