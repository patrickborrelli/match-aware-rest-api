var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventType = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    },
    priority: Number,
    field_type: {
        type: String,
        trim: true,
        unique: true,
        enum: ['PRACTICE', 'GAME', 'TOURNAMENT', 'TRAINING', 'ALL_PURPOSE']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EventType', EventType);