var mongoose = require('mongoose');
var Event = require('./event.js');
var Message = require('./message.js');
var BidCampaign = require('./bidCampaign.js');
var Schema = mongoose.Schema;

var BidResponse = new Schema({
    message:  {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }], 
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'BidCampaign'
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BidResponse', BidResponse);