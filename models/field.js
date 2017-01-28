var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Facility = require('./facility.js');
var FieldSize = require('./fieldSize.js');
var Closure = require('./closure.js');

var Field = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    }, 
    facility: {
        type: Schema.Types.ObjectId,
        ref: 'Facility'
    }, 
    size: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'FieldSize'
    }, 
    lights: {
        type: Boolean,
        default: false
    },
    condition: {
        type: Number,
        default: 6
    },
    game: {
        type: Boolean,
        default: true
    }, 
    practice: {
        type: Boolean,
        default: false
    },
    tournament: {
        type: Boolean,
        default: false
    },
    training: {
        type: Boolean,
        default: false
    },
    closures: [{
        type: Schema.Types.ObjectId,
        ref: 'Closure'
    }],
    surface: {
        type: String,
        enum: ['GRASS', 'TURF']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Field', Field);