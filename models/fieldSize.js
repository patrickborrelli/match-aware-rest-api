var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldSize = new Schema({
    name: {
        type: String,
        required: true
    },
    min_length: Number,
    max_length: Number,
    min_width: Number,
    max_width: Number,
    unit: {
        type: String,
        enum: ['FEET', 'YARDS', 'METERS']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FieldSize', FieldSize);