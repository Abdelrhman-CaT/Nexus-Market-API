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
    return jwt.sign(user, (process.env.secKey || config.secretKey), { expiresIn: 86400 });
};

var opts = {
    jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: (process.env.secKey || config.secretKey)
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


exports.verifyUser = (req, res, next)=>{
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
        } 
        else if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "invalid token" });
        } else {
            // establish a session
            req.logIn(user, (err) => {
                if (err) {
                    res.statusCode = 401;
                    res.setHeader("Content-Type", "application/json");
                    res.json({success: false, status: "token verification failed",
                        err: {
                                name: "session error",
                                message: "Could not establish a session"
                            },
                    });
                } 
                else {
                    return next();
                }
            });
        }
    })(req, res, next);
}


exports.verifyAdmin = (req, res, next)=>{
    if(req.user.admin == true){
        return next();
    }
    else{
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.json({success: false, status: "you are not an admin"});
    }
}