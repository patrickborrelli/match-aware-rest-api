var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AgeGroup = require('./ageGroup.js');
var League = require('./league.js');

var Rule = new Schema({
    league: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    age_group: { 
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    duration_minutes: {
        type: Number,
        default: 0
    },
    fielded_players: {
        type: Number,
        default: 0
    },
    max_roster: {
        type: Number,
        default: 14
    },
    goalkeeper: {
        type: Boolean,
        default: true
    },
    max_field_length: {
        type: Number,
        default: 0
    },
    max_field_width: {
        type: Number,
        default: 0
    },
    goal_width_ft: {
        type: Number,
        default: 0
    },
    goal_height_ft: {
        type: Number,
        default: 0
    },
    num_periods: {
        type: Number,
        default: 2
    },
    period_duration_minutes: {
        type: Number,
        default: 25
    },
    intermission_duration_minutes: {
        type: Number,
        default: 10
    },
    ball_size: {
        type: String,
        enum: ['2', '3', '4', '5']
    },
    offisde: {
        type: Boolean,
        default: true
    },
    heading: {
        type: Boolean,
        default: true
    },
    build_out_line: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Rule', Rule);