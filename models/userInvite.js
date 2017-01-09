var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Role = require('./role.js');

var UserInvite = new Schema({
    invite_key: {
        type: number,
        required: true
    },
    email: String,
    mobile: String,
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    status: {
        type: String,
        enum: ['SENT', 'ACCEPTED', 'REJECTED']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserInvite', UserInvite);