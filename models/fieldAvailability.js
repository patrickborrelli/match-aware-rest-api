var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Field = require('./field.js');

var FieldAvailability = new Schema({
    field: {
        type: Schema.Types.ObjectId,
        ref: 'Field'
    },
    game: Boolean,
    practice: Boolean,
    tournament: Boolean,
    training: Boolean,
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    date_year: {
        type: String
    },
    date_month:  {
        type: String
    },
    date_day:  {
        type: String
    },
    start_time:  {
        type: String
    },
    end_time:  {
        type: String
    },
    duration: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('FieldAvailability', FieldAvailability);