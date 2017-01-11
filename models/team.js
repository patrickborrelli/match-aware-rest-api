var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Gender = require('./gender.js');
var AgeGroup = require('./ageGroup.js');

var Team = new Schema({
    
    name: {
        type: String,
        require: true
    }, 
    gender: {
        type: Schema.Types.ObjectId,
        ref: 'Gender'
    },
    age_group: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', Team);