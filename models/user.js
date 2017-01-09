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
    firstName: {
        type: String,
        default: '',
        required: true
    },
    lastName: {
        type: String,
        default: '',
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    websiteUrl: String,
    emailAddress: {
        type: String,
        required: true
    },
    imageFile: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    profileBrief: String,
    profile: String,
    disciplinaryStrikes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

User.methods.getFullName = function() {
    return(this.firstName + ' ' + this.lastName);
};

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);