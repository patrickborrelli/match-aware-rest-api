var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Certification = require('./certification.js');
var License = require('./license.js');
var Role = require('./role.js');
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type: String,
        required: true
    },
    password: String,
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'Role'
    }],
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
    profile_image: {
        type: String,
        default: './iamges/defaultUser.png'
    },
    address: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,
    certifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Certification'
    }],
    licenses: [{
        type: Schema.Types.ObjectId,
        ref: 'License'
    }]
}, {
    timestamps: true
});

User.methods.getFullName = function() {
    return(this.first_name + ' ' + this.last_name);
};

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);