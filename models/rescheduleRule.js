var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RescheduleRule = new Schema({
    timespan_daye: {
        required: true,
        type: number
    },
    consequence: {
        type: String,
        enum: ['FORFEIT', 'FINE', 'FORFEIT_FINE']
    },
    fine: number
}, {
    timestamps: true
});

module.exports = mongoose.model('RescheduleRule', RescheduleRule);