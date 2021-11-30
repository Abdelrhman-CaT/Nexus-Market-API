/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var express = require('express');
var mongoose = require("mongoose");
var inventoryRouter = express.Router();


var passport = require("passport");


const INV1 = require("../models/inventoryItem1Schema");
const INV2 = require("../models/inventoryItem2Schema");


var cors = require("../cors");
const functions = require("../functions");
const authenticate = require("../authenticate");

inventoryRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});


inventoryRouter.route("/")

// add an item to my inventory
.post(authenticate.verifyUser, functions.checkForRequiredFields("name", "amount", "price", "description", "imageLink"),
functions.checkNumbersValidity("amount", "price"), (req, res, next)=>{
    functions.distribute("INV", req, res);
})

// get all items in my inventory
.get(authenticate.verifyUser, (req, res, next)=>{
    INV2.find({owner: mongoose.Types.ObjectId(req.user._id)}).populate("_id").then((items)=>{
        
        let output = [];
        for(item of items){
            let temp = {
                id: item._id._id,
                name: item._id.name,
                price: item.price,
                amount: item.amount,
                imageLink: item._id.imageLink,
                description: item._id.description
            };
            output.push(temp);
        }
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({success: true, items: output});
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    })
});


inventoryRouter.route("/:itemId")

// get info about a specific item in my inventory
.get(authenticate.verifyUser, (req, res, next)=>{
    INV2.findOne({_id: mongoose.Types.ObjectId(req.params.itemId), owner: mongoose.Types.ObjectId(req.user._id)})
    .populate("_id").then((item)=>{
        if(item == null){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.json({success: false, status: "item doesn't exist in your inventory"});
        }
        else{
            let temp = {
                id: item._id._id,
                name: item._id.name,
                price: item.price,
                amount: item.amount,
                imageLink: item._id.imageLink,
                description: item._id.description
            };

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({success: true, item: temp});
        }
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



module.exports = inventoryRouter;