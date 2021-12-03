/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var express = require('express');
var userRouter = express.Router();

var passport = require("passport");

const USER1 = require("../models/user1Schema");
const USER2 = require("../models/user2Schema");

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
"username", "password", "storeName", "email"), functions.checkUniqueness(USER2, "storeName", "storeName") ,(req, res, next)=>{
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
userRouter.post("/login", cors.corsWithOptions, functions.checkForRequiredFields("username", "password"), (req, res, next)=>{
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
      // establish a session
      req.logIn(user, (err) => {
        if (err) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.json({success: false, status: "login unsuccessful",
            err: {
              name: "session error",
              message: "Could not establish a login session"
            },
          });
        } 
        else {
          var token = authenticate.getToken({ _id: req.user._id });
          USER2.findById(req.user._id).then((user)=>{
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              status: "user login successfully",
              token: token,
              admin: req.user.admin,
              storeName: user.storeName
            });
          })
          .catch((err)=>{
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
          });
        }
      });
    }
  })(req, res, next);
});



/* 
User Profile
----------------
*/
userRouter.get("/profile", authenticate.verifyUser, (req, res, next)=>{
    USER2.findById(req.user._id).populate("_id").then((user)=>{
        output = {};
        output.id = user._id._id;
        output.firstName = user._id.firstName;
        output.lastName = user._id.lastName;
        output.balance = user.balance;
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({success: true, user: output});
    })
    .catch((err)=>{
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



/* 
Get all users
----------------
*/
userRouter.get("/", authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next)=>{
    USER2.find({}).populate("_id").then((users)=>{
        output = [];
        for(user of users){
          temp = {};
          temp.id = user._id._id;
          temp.firstName = user._id.firstName;
          temp.storeName = user.storeName;
          temp.lastName = user._id.lastName;
          temp.email = user._id.email;
          temp.balance = user.balance;
          temp.phoneNumber = user._id.phoneNumber;
          output.push(temp);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({success: true, users: output});
    })
    .catch((err)=>{
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



/* 
Increase balance
------------------
*/
userRouter.put("/wallet/deposit", authenticate.verifyUser, functions.checkForRequiredFields("cardNum", "amount", "cvv"), functions.checkNumbersValidity("amount") ,(req, res, next)=>{
  USER2.findById(req.user._id).then((user)=>{
    user.balance += req.body.amount;
    user.save().then((user)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({success: true, status: "balance added successfully"});
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
}).catch((err)=>{
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
});
});



/* 
decrease balance
------------------
*/
userRouter.put("/wallet/withdraw", authenticate.verifyUser, functions.checkForRequiredFields("cardNum", "amount", "cvv"),
functions.checkNumbersValidity("amount"), (req, res, next)=>{
  USER2.findById(req.user._id).then((user)=>{
    if(user.balance < req.body.amout){
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.json({success: false, status: "low balance"});
    }
    else{
        user.balance -= req.body.amount;
        user.save().then((user)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({success: true, status: "balance removed successfully"});
        })
        .catch((err)=>{
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
        });
    }
}).catch((err)=>{
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
});
});



module.exports = userRouter;
