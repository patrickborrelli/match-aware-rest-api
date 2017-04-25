var mongoose = require('mongoose');
var AgeGroup = require('./ageGroup.js');
var Event = require('./event.js');
var User = require('./user.js');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

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
    recipients: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],    
    submissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }]    
}, {
    timestamps: true
});

BidCampaign.plugin(deepPopulate);
module.exports = mongoose.model('BidCampaign', BidCampaign);