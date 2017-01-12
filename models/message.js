var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Event = require('./event.js');
var User = require('./user.js');

var Message = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    text: String,
    created_date: Number,
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    visible: {
        type: Boolean,
        default: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', Message);