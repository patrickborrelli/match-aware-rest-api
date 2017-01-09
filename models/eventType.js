var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventType = new Schema({
    name: {
        required: true,
        type: String
    }    
}, {
    timestamps: true
});

module.exports = mongoose.model('EventType', EventType);