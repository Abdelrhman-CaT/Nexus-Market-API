/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var express = require('express');
var mongoose = require("mongoose");
var inventoryRouter = express.Router();



const INV1 = require("../models/inventoryItem1Schema");
const INV2 = require("../models/inventoryItem2Schema");
const STR1 = require("../models/storeItem1Schema");
const STR2 = require("../models/storeItem2Schema");


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
})

// modify the info of a specific item in my inventory
.put(authenticate.verifyUser, functions.checkNumbersValidity("amount", "price"), (req, res, next)=>{
    INV2.findOne({_id: mongoose.Types.ObjectId(req.params.itemId), owner: mongoose.Types.ObjectId(req.user._id)})
    .then((inv2Item)=>{
        if(inv2Item == null){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.json({success: false, status: "item doesn't exist in your inventory"});
        }
        else{
            if(req.body.name || req.body.description || req.body.imageLink){
                INV1.findById(req.params.itemId).then((inv1Item)=>{
                    if(req.body.name){
                        inv1Item.name = req.body.name;
                    }
                    if(req.body.description){
                        inv1Item.description = req.body.description;
                    }
                    if(req.body.imageLink){
                        inv1Item.imageLink = req.body.imageLink;
                    }
                    inv1Item.save().then((i)=>{
                        if(!(req.body.price || req.body.amount)){
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json({ success: true, status: "item edited successfully"});
                        }
                    })
                    .catch((err)=>{
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                    })
                })
                .catch((err)=>{
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                })
            }

            if(req.body.price){
                inv2Item.price = req.body.price;
                if(!req.body.amount){
                    inv2Item.save().then((i)=>{
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: true, status: "item edited successfully"});
                    })
                    .catch((err)=>{
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                    });
                } 
            }

            if(req.body.amount){
                STR2.findOne({owner: mongoose.Types.ObjectId(req.user._id), item: mongoose.Types.ObjectId(inv2Item._id)})
                .populate("_id").then((sellItem)=>{
                    if(sellItem == null){
                        inv2Item.amount = req.body.amount;
                        inv2Item.save().then((i)=>{
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json({ success: true, status: "item edited successfully"});
                        }).catch((err)=>{
                            res.statusCode = 500;
                            res.setHeader("Content-Type", "application/json");
                            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                        });
                    }
                    else{
                        if(sellItem._id.sellAmount > req.body.amount){
                            res.statusCode = 400;
                            res.setHeader("Content-Type", "application/json");
                            res.json({success: false, status: "amount is less than the amount presented in the store for that item"});
                        }
                        else{
                            inv2Item.amount = req.body.amount;
                            inv2Item.save().then((i)=>{
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json({ success: true, status: "item edited successfully"});
                            }).catch((err)=>{
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json");
                                res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                            });
                        }
                    }
                });
            }
        }
    })
    .catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
})

// remove an item from my inventory
.delete(authenticate.verifyUser, (req, res, next)=>{
    INV2.findOne({_id: mongoose.Types.ObjectId(req.params.itemId), owner: mongoose.Types.ObjectId(req.user._id)})
    .then((item)=>{
        if(item == null){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.json({success: false, status: "item doesn't exist in your inventory"});
        }
        else{
            INV1.findByIdAndRemove(req.params.itemId).then(()=>{
                item.remove().then(()=>{
                    STR2.findOne({item: mongoose.Types.ObjectId(req.params.itemId)}).then((str2Item)=>{
                        if(str2Item){
                            STR1.findByIdAndRemove(str2Item._id).then(()=>{
                                str2Item.remove().then(()=>{
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json({success: true, status: "item deleted successfully"});
                                })
                                .catch((err)=>{
                                    res.statusCode = 500;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                                })
                            })
                            .catch((err)=>{
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json");
                                res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                            })
                        }
                        else{
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json({success: true, status: "item deleted successfully"});
                        }
                    })
                    .catch((err)=>{
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                    })
                })
                .catch((err)=>{
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                });
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
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



module.exports = inventoryRouter;