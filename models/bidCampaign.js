var mongoose = require('mongoose');
var AgeGroup = require('./ageGroup.js');
var Event = require('./event.js');
var Schema = mongoose.Schema;

var BidCampaign = new Schema({
    name: {
        type: String,
        required: true
    },
    start_date: {
        type: Number,
        required: true
    },
    end_date: {
        type: Number,
        required: true
    },
    min_age: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    max_age: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup'
    },
    number_options: Number,
    message:  {
        type: String,
        required: true
    },
    submissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }]    
}, {
    timestamps: true
});

module.exports = mongoose.model('License', License);