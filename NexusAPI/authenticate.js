const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

// json web tokens
const jwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const config = require("./config");
const USER1 = require("./models/user1Schema");

exports.local = passport.use(new localStrategy(USER1.authenticate()));
passport.serializeUser(USER1.serializeUser());
passport.deserializeUser(USER1.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, { expiresIn: config.jwtDuration });
};

var opts = {
    jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretKey
};

exports.jwtPassport = passport.use(
    new jwtStrategy(opts, (jwtPayload, done) => {
      USER1.findOne(
        { _id: jwtPayload._id },
        (err, user) => {
            if (err) {
                return done(err, false);
            } 
            else if (user) {
                return done(null, user);
            } 
            else {
                return done(null, false);
            }
        });
    })
);