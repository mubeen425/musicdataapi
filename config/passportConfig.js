const passport = require("passport");
const config = require('config');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.get('google.clientID'),
      clientSecret: config.get('google.clientSecret'),
      callbackURL: config.get('google.callBackUrl')
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("User Profie => ", profile);
      return done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy({
    clientID: config.get('facebook.appID'),
    clientSecret: config.get('facebook.appSecret'),
    callbackURL: config.get('facebook.callBackUrl'),
    profileFields: ["email", "name"]
  },
    function (accessToken, refreshToken, profile, done) {
      console.log("User Profie => ", profile);
      return done(null, profile);
    }
  )
);

passport.use(new TwitterStrategy({
  consumerKey: config.get('twitter.apiKey'),
  consumerSecret: config.get('twitter.apiSecret'),
  callbackURL: config.get('twitter.callBackUrl'),
},
  function (accessToken, refreshToken, profile, done) {
    console.log("User Profie => ", profile);
    return done(null, profile);
  }
));

module.exports = passport;