var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AgeGroup = require('./ageGroup.js');
var RescheduleRule = require('./rescheduleRule.js');
var LeagueType = require('./leagueType.js');

var League = new Schema({
    name: {
        type: String,
        required: true
    },
    short_name: {
        type: String,
        required: true
    },
    min_age_group: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    max_age_group: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: 'LeagueType',
        required: true
    },
    reschedule_rule: {
        type: Schema.Types.ObjectId,
        ref: 'RescheduleRule'
    },
    logo_url: {
        type: String,
        default: './images/no-logo.png'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('League', League);