/*
    Author: Abdelrahman Hany
    Created on: 8-Nov-2021
*/

var express = require('express');
var userRouter = express.Router();
var cors = require("../cors");
var mongoose = require("mongoose");
const USER1 = require("../models/user1Schema");
const USER2 = require("../models/user2Schema");


userRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});


userRouter.post('/signup', cors.corsWithOptions, function(req, res, next) {
  USER1.register(
    new USER1({
      username: req.body.userName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email : req.body.email,
      phoneNumber: (req.body.phoneNumber)?req.body.phoneNumber : ""
    }),
    req.body.password,
    (err, user1) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "Process Failed1", err: err });
      } 
      else {
        user1
          .save()
          .then((user1) => {
            user2 = new USER2({
              _id: mongoose.Types.ObjectId(user1._id),
              storeName: req.body.storeName
            });
            user2.save()
            .then((user2)=>{
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ success: true, status: "user registered successfully" });
            })
            .catch((err)=>{
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.json({
                success: false,
                status: "Process Failed2",
                err: err,
            });
            })            
          })
          .catch((err) => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: false,
              status: "Process Failed3",
              err: err,
            });
          });
      }
    }
  );
});

userRouter.get("/", cors.corsWithOptions, (req,res,next)=>{
  USER2.find({}).populate("_id").then((users)=>{
    res.json(users);
  })
});

module.exports = userRouter;
