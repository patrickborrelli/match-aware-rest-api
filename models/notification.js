var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Event = require('./event.js');
var User = require('./user.js');

var Notification = new Schema({
    //the status field is only used with an assignment type of notification, indicates the assignees response
    status: {  
        type: String,
        enum: ['SUBMITTED', 'PENDING', 'ACCEPTED', 'REJECTED']
    },
    type: { 
        type: String,
        required: true,
        enum: ['ASSIGNMENT', 'GENERAL', 'CLOSURE', 'NEW_EVENT', 'NEW_MESSAGE', 'MODIFIED_EVENT', 'BID']
    },
    //the position field is only used with an assignment type of notification, indicating which position the ref or trainer is assigned to.
    position: {
        type: String,
        enum: ['CENTER', 'SIDELINE', 'HEAD', 'ASSISTANT']
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    text: String,
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', Notification);