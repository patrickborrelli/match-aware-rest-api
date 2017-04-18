var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventType = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        enum: ['CLINIC_SESSION', 'CLUB_TRYOUT', 'LEAGUE_GAME', 'OPEN_TRAINING', 'PRACTICE', 'STATE_CUP_GAME', 'TEAM_TRAINING', 'TEAM_TRYOUT', 'TOURNAMENT_GAME', 'PRACTICE_BID', 'ADHOC_REQUEST']
    },
    priority: Number,
    field_type: {
        type: String,
        trim: true,
        enum: ['PRACTICE', 'GAME', 'TOURNAMENT', 'TRAINING', 'ALL_PURPOSE']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EventType', EventType);