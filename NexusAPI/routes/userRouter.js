/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var express = require('express');
var userRouter = express.Router();

var passport = require("passport");

var cors = require("../cors");
const functions = require("../functions");
const authenticate = require("../authenticate");

userRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});


/* 
Sign Up a user
----------------
*/
userRouter.post('/signup', cors.corsWithOptions, functions.checkForRequiredFields("firstName", "lastName", 
"userName", "password", "storeName", "email") ,(req, res, next)=>{
  // check for email validity
  let email_regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(!(req.body.email.match(email_regex))){
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: false,
			  status: "invalid email" 
      });
  }
  else{
    functions.distribute("USER", req, res);
  }
});



/* 
User Login
----------------
*/
userRouter.get("/login", cors.corsWithOptions, functions.checkForRequiredFields("username", "password"), (req, res, next)=>{
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      // server error
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    } 
    else if (!user) {
      // if the user doesn't exist or wrong password ... etc
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "login unsuccessful", err: info });
    }
    else{
      req.logIn(user, (err) => {
        // establish a session
        if (err) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: false,
            status: "login unsuccessful",
            err: {
              name: "session error",
              message: "Could not establish a login session"
            },
          });
        } 
        else {
          var token = authenticate.getToken({ _id: req.user._id });
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: true,
            status: "user login successfully",
            token: token,
          });
        }
      });
    }
  })(req, res, next);
});



module.exports = userRouter;
