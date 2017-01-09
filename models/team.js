var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Team = new Schema({
    
    name: {
        type: String,
        require: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', Team);