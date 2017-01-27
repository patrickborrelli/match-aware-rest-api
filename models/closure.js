var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Closure = new Schema({
    type: {
        type: String,
        enum: ['CURRENT', 'FUTURE']
    },
    start: Number,
    end: Number,
    message: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Closure', Closure);