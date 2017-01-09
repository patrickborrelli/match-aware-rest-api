var secretKey = process.env.MA_SECRET_KEY;
var mongoUrl = process.env.MA_MONGO_URL;
var fbClientId = process.env.MA_FB_CLIENTID;
var fbClientSecret = process.env.MA_FB_SECRET;

module.exports = {
    'secretKey': secretKey,
    'mongoUrl': mongoUrl,
    'facebook': {
        clientID: fbClientId,
        clientSecret: fbClientSecret,
        callbackURL: 'http://localhost:3000/users/facebook/callback'
    }
}