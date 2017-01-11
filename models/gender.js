var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Gender = new Schema({
    name: {
        type: String,
        required: true
    },
    short_name: String    
}, {
    timestamps: true
});

module.exports = mongoose.model('Gender', Gender);