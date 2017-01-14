var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Facility = require('./facility.js');
var FieldSize = require('./fieldSize.js');

var Field = new Schema({
    name: {
        required: true,
        type: String
    }, 
    facility: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Facility'
    }, 
    size: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'FieldSize'
    }, 
    lights: Boolean,
    condition: Number,
    game: Boolean, 
    practice: Boolean,
    tournament: Boolean,
    training: Boolean,
    surface: {
        type: String,
        enum: ['GRASS', 'TURF']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Field', Field);