var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventType = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    }    
}, {
    timestamps: true
});

module.exports = mongoose.model('EventType', EventType);