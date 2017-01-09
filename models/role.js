var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var Role = new Schema({
    
    name: {
        required: true,
        type: String
        //enum: ['CLUB_ADMIN', 'FIELD_ADMIN', 'REFEREE_ASSIGNOR', 'TRAINING_ADMIN', 'COACH', 'TRAINER', 'REFEREE', 'PARENTPLAYER']
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
  timestamps: true    
});

module.exports = mongoose.model('Role', Role);