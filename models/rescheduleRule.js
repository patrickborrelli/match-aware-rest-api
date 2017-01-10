var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RescheduleRule = new Schema({
    timespan_days: {
        required: true,
        type: Number
    },
    consequence: {
        type: String,
        enum: ['FORFEIT', 'FINE', 'FORFEIT_FINE']
    },
    fine: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('RescheduleRule', RescheduleRule);