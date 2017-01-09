var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var UserSetting = new Schema({
    
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schedule_view_range: {
        type: String,
        enum: ['ONE_WEEK', 'FULL']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserSetting', UserSetting);