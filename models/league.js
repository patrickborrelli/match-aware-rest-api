var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AgeGroup = require('./ageGroup.js');
var LeagueType = require('./leagueType.js');

var League = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    short_name: {
        type: String,
        required: true,
        trim: true
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
    reschedule_time: {
        required: true,
        type: Number,
        default: 0
    },
    reschedule_consequence: {
        type: String,
        enum: ['FORFEIT', 'FINE', 'FORFEIT_FINE']
    },
    reschedule_fine: {
        type: Number,
        default: 0
    },
    logo_url: {
        type: String,
        default: './images/no-logo.png'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('League', League);