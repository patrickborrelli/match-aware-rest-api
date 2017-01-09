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
    duration_minutes: number,
    fielded_players: number,
    goalkeeper: Boolean,
    max_field_length: number,
    max_field_width: number,
    goal_width_ft: number,
    goal_height_ft: number,
    num_periods: number,
    period_duration_minutes: number,
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