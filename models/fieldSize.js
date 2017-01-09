var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldSize = new Schema({
    name: {
        type: String,
        required: true
    },
    min_length: number,
    max_length: number,
    min_width: number,
    max_width: number
}, {
    timestamps: true
});

module.exports = mongoose.model('FieldSize', FieldSize);