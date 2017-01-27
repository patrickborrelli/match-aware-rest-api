var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldSize = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    min_length: {
        type: Number,
        default: 50
    },
    max_length: {
        type: Number,
        default: 100
    },
    min_width: {
        type: Number,
        default: 25
    },
    max_width: {
        type: Number,
        default: 50
    },
    unit: {
        type: String,
        enum: ['FEET', 'YARDS', 'METERS'],
        default: 'YARDS'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FieldSize', FieldSize);