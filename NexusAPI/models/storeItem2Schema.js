/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const storeItem1Schema = require("./storeItem1Schema");
const inventoryItem1Schema = require("./inventoryItem1Schema");
const dbs = require('../dBconfig'); // require only in case of using distributed db


var otherSellersSchema = new schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

var storeItemSchema = new schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: storeItem1Schema
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: inventoryItem1Schema
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    otherSellers: [otherSellersSchema]
});


// Put in db2
module.exports = dbs.d2.model('StoreItem' , storeItemSchema);

