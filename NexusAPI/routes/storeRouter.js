/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var express = require('express');
var mongoose = require("mongoose");
var storeRouter = express.Router();



const INV1 = require("../models/inventoryItem1Schema");
const INV2 = require("../models/inventoryItem2Schema");
const STR1 = require("../models/storeItem1Schema");
const STR2 = require("../models/storeItem2Schema");


var cors = require("../cors");
const functions = require("../functions");
const authenticate = require("../authenticate");

storeRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});


storeRouter.get("/mystore", authenticate.verifyUser, (req, res, next)=>{
    STR2.find({$or:[{seller: mongoose.Types.ObjectId(req.user._id)}, {otherSellers: {$elemMatch:{_id: mongoose.Types.ObjectId(req.user._id)}}}]})
    .populate("_id").populate("item").then((items)=>{
        let output = [];
        for(item of items){
            let temp = {
                id: item._id._id,
                name: item.item.name,
                price: item._id.sellPrice,
                amount: item._id.sellAmount,
                imageLink: item._id.imageLink,
                description: item.item.description
            };
            if(item.seller.equals(req.user._id)){
                temp.state = "owned";
            }
            else{
                temp.state = "imported";
            }
            output.push(temp);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, items: output});
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "process failed", err: {name: err.name, message: err.message} });
    });
});




module.exports = storeRouter;