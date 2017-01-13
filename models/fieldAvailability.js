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
    start: Number,
    end: Number,
    duration: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('FieldAvailability', FieldAvailability);