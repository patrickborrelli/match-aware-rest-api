var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Club = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    short_name: {
        type: String,
        required: true,
        trim: true
    },
    logo_url: {
        type: String,
        default: './images/no-logo.png'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Club', Club);