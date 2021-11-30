/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const inventoryItem1Schema = require("./inventoryItem1Schema");
const dbs = require('../dBconfig'); // require only in case of using distributed db


var inventorySchema = new schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: inventoryItem1Schema
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    amount: {
        type: Number,
        min: 0
    },
    price: {
        type: Number,
        min: 0
    }
});


// Put in db2
module.exports = dbs.d2.model('InventoryItem' , inventorySchema);

