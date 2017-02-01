var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Certification = require('./certification.js');
var License = require('./license.js');
var ClubRole = require('./clubRole.js');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true
    },
    first_name: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    last_name: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        trim: true,
        required: true
    },
    profile_image_url: {
        type: String,
        default: './images/defaultUser.png'
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    postal_code: {
        type: String,
        trim: true
    },
    certifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Certification'
    }],
    licenses: [{
        type: Schema.Types.ObjectId,
        ref: 'License'
    }],
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'ClubRole'
    }],
    OauthId: String,
    OauthToken: String,
}, {
    timestamps: true
});

User.plugin(deepPopulate);

User.methods.getFullName = function() {
    return(this.first_name + ' ' + this.last_name);
};

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);