var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Field = require('./field.js');
var Club = require('./club.js');
var Closure = require('./closure.js');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var Facility = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        unique: true
    }, 
    short_name: {
        required: true,
        type: String,
        trim: true
    }, 
    club_affiliation: {
        type: Schema.Types.ObjectId,
        ref: 'Club'
    },
    fields: [{
        type: Schema.Types.ObjectId,
        ref: 'Field'
    }],
    address: {
        required: true,
        type: String,
        trim: true
    }, 
    city: {
        required: true,
        type: String,
        trim: true
    }, 
    state: {
        required: true,
        type: String,
        trim: true
    }, 
    postal_code: {
        required: true,
        type: String,
        trim: true
    }, 
    latitude: Number,
    longitude: Number,
    sun_start_time: String,
    sun_stop_time: String,
    mon_start_time: String,
    mon_stop_time: String,
    tue_start_time: String,
    tue_stop_time: String,
    wed_start_time: String,
    wed_stop_time: String,
    thu_start_time: String,
    thu_stop_time: String,
    fri_start_time: String,
    fri_stop_time: String,
    sat_start_time: String,
    sat_stop_time: String,  
    google_maps_address: String,
    indoor: Boolean,
    closures: [{
        type: Schema.Types.ObjectId,
        ref: 'Closure'
    }]
}, {
    timestamps: true
});

Facility.plugin(deepPopulate);
module.exports = mongoose.model('Facility', Facility);
