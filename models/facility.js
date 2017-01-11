var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Facility = new Schema({
    name: {
        required: true,
        type: String
    }, 
    short_name: {
        required: true,
        type: String
    }, 
    address: {
        required: true,
        type: String
    }, 
    city: {
        required: true,
        type: String
    }, 
    state: {
        required: true,
        type: String
    }, 
    postal_code: {
        required: true,
        type: String
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
    indoor: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Facility', Facility);
