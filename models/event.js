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
    date: Date,
    start_time: String,
    end_time: String,
    field: {
        type: Schema.Types.ObjectId,
        ref: 'Field'
    },
    recurring: Boolean,
    status: {
        type: String,
        enum: ['PROPOSED', 'PENDING', 'SCHEDULED_PENDING_ASSIGNMENT', 'SCHEDULED', 'COMPLETED', 'PENDING_RESCHEDULE', 'PENDING_CHANGE_REQUEST']
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
