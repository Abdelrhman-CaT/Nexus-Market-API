/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var express = require('express');
var userRouter = express.Router();
var cors = require("../cors");
var mongoose = require("mongoose");

const USER1 = require("../models/user1Schema");
const USER2 = require("../models/user2Schema");

const functions = require("../functions");

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





module.exports = userRouter;
