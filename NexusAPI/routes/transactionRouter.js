/*
    Author: Abdelrahman Hany
    Created on: 1-Dec-2021
*/

var express = require('express');
var transactionRouter = express.Router();

const mongoose = require("mongoose");

const USER1 = require("../models/user1Schema");
const USER2 = require("../models/user2Schema");
const TRAN1 = require("../models/transaction1Schema");
const TRAN2 = require("../models/transaction2Schema")

var cors = require("../cors");
const functions = require("../functions");
const authenticate = require("../authenticate");


transactionRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});


// get my sold items
transactionRouter.get("/sold",  authenticate.verifyUser, (req, res, next)=>{
    TRAN2.find({seller: mongoose.Types.ObjectId(req.user._id)}).populate("_id").populate("buyer").then((transactions)=>{
        let output = [];
        for(trans of transactions){
            let temp = {
                itemName: trans._id.itemName,
			    price: trans._id.price,
			    amount: trans._id.amount,
			    imageLink: trans._id.itemImageLink,
			    date: trans.createdAt,
			    buyerStoreId: trans.buyer._id,
                buyerStoreName: trans.buyer.storeName 
            };
            output.push(temp);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, transactions: output});
    }).catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



// get my purchased items
transactionRouter.get("/purchased", authenticate.verifyUser, (req, res, next)=>{
    TRAN2.find({buyer: mongoose.Types.ObjectId(req.user._id)}).populate("_id").populate("seller").then((transactions)=>{
        let output = [];
        for(trans of transactions){
            let temp = {
                itemName: trans._id.itemName,
			    price: trans._id.price,
			    amount: trans._id.amount,
			    imageLink: trans._id.itemImageLink,
			    date: trans.createdAt,
			    sellerStoreId: trans.seller._id,
                sellerStoreName: trans.seller.storeName 
            };
            output.push(temp);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, transactions: output});
    }).catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});



// get all transactions
transactionRouter.get("/",  authenticate.verifyUser, (req, res, next)=>{
    TRAN2.find({}).populate("_id").populate("seller")
    .populate("buyer").then((transactions)=>{
        let output = [];
        for(let trans of transactions){
            let temp = {
                itemName: trans._id.itemName,
			    price: trans._id.price,
			    amount: trans._id.amount,
			    imageLink: trans._id.itemImageLink,
			    date: trans.createdAt,
			    sellerStoreId: trans.seller._id,
                sellerStoreName: trans.seller.storeName,
                buyerStoreId: trans.buyer._id,
                buyerStoreName: trans.buyer.storeName 
            };
            output.push(temp);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, transactions: output});
    }).catch((err)=>{
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
    });
});




module.exports = transactionRouter;