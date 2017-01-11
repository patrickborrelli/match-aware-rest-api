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
    duration_minutes: Number,
    fielded_players: Number,
    goalkeeper: Boolean,
    max_field_length: Number,
    max_field_width: Number,
    goal_width_ft: Number,
    goal_height_ft: Number,
    num_periods: Number,
    period_duration_minutes: Number,
    ball_size: {
        type: String,
        enum: ['2', '3', '4', '5']
    },
    offisde: Boolean,
    heading: Boolean,
    build_out_line: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Rule', Rule);