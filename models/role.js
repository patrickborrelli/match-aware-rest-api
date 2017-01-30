var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.js');

var Role = new Schema({
    
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
  timestamps: true    
});

module.exports = mongoose.model('Role', Role);