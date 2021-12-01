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

// get all items from my store
storeRouter.get("/mystore", authenticate.verifyUser, (req, res, next)=>{
    STR2.find({$or:[{owner: mongoose.Types.ObjectId(req.user._id)}, {otherSellers: {$elemMatch:{_id: mongoose.Types.ObjectId(req.user._id)}}}]})
    .populate("_id").populate("item").then((items)=>{
        let output = [];
        for(item of items){
            let temp = {
                id: item._id._id,
                name: item.item.name,
                price: item._id.sellPrice,
                amount: item._id.sellAmount,
                imageLink: item.item.imageLink,
                description: item.item.description
            };
            if(item.owner.equals(req.user._id)){
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



storeRouter.route("/mystore/:itemId")

// get info about a specific item in my store
.get(authenticate.verifyUser, (req, res, next)=>{
    STR2.findById(req.params.itemId).populate("_id").populate("item").then((item)=>{
        if(item == null){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.json({success: false, status: "item doesn’t exist in your store"});
        }
        else{
            if(item.owner.equals(req.user._id) || item.otherSellers.id(req.user._id)){
                let output = {
                    id: item._id._id,
                    name: item.item.name,
                    price: item._id.sellPrice,
                    amount: item._id.sellAmount,
                    imageLink: item.item.imageLink,
                    description: item.item.description,
                    state: (item.owner.equals(req.user._id))?"owned":"imported"
                };
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({success: true, item: output});
            }
            else{
               res.statusCode = 404;
               res.setHeader("Content-Type", "application/json");
               res.json({success: false, status: "item doesn’t exist in your store"});
            }
        }
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "process failed", err: {name: err.name, message: err.message} });
    });
})


// add in a item from my inventory to my store
.post(authenticate.verifyUser, functions.checkForRequiredFields("amount", "price"), 
functions.checkNumbersValidity("amount", "price"), 
(req, res, next)=>{
    STR2.findOne({owner: mongoose.Types.ObjectId(req.user._id), item: mongoose.Types.ObjectId(req.params.itemId)})
    .then((strItem)=>{
        if(strItem){
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "item already exists in your store"});
        }
        else{
            INV2.findOne({_id: mongoose.Types.ObjectId(req.params.itemId), owner: req.user._id}).then((result)=>{
                if(result == null){ 
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ success: false, status: "item doesn't exist in your inventory"});
                }
                else{
                    if(result.amount < req.body.amount){
                        res.statusCode = 400;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: false, status: "the input amount is larger than the amount presented in the inventory for that item"});
                    }
                    else{
                        functions.distribute("STR", req, res);
                    }
                }
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
            });
        }
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



// add item from other stores to my store
storeRouter.put("/add/:itemId", authenticate.verifyUser, 
(req, res, next)=>{
    STR2.findById(req.params.itemId).then((item)=>{
        if(item == null){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "item doesn't exist"});
        }
        else if(item.otherSellers.id(req.user._id) || item.owner.equals(mongoose.Types.ObjectId(req.user._id))){
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "item already exists in your store"});
        }
        else{
            item.otherSellers.push({
                _id: mongoose.Types.ObjectId(req.user._id)
            });
            item.save().then((i)=>{
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: true, status: "item added successfully to your store"});
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: true, status: "process failed", err: {name: err.name, message: err.message} });
            });
        }
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



module.exports = storeRouter;