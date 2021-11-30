/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const transaction1Schema = require("./transaction1Schema");
const dbs = require('../dBconfig'); // require only in case of using distributed db


var transactionSchema = new schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: transaction1Schema
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{
    timestamps: true
});


// Put in db2
module.exports = dbs.d2.model('Transaction' , transactionSchema);

