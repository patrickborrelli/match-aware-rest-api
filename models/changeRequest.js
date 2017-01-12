var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Event = require('./event.js');
var User = require('./user.js');

var ChangeRequest = new Schema({
    original_event: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    changed_event:  {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    status: {
        type: String,   
        enum: ['SUBMITTED','PENDING','REJECTED','ACCEPTED']
    },
    text: String,
    approver:  {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    submitter:  {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChangeRequest', ChangeRequest);