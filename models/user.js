var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type: String,
        required: true
    },
    password: String,
    OauthId: String,
    OauthToken: String,
    first_name: {
        type: String,
        default: '',
        required: true
    },
    last_name: {
        type: String,
        default: '',
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        required: true
    },
    profile_image: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postal_code: String
}, {
    timestamps: true
});

User.methods.getFullName = function() {
    return(this.firstName + ' ' + this.lastName);
};

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);