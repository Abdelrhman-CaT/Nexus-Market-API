/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dbs = require('../dBconfig'); // require only in case of using distributed db


var transactionSchema = new schema({
    amount: {
        type: Number,
        min: 0
    },
    price: {
        type: Number,
        min: 0
    },
    itemName: {
        type: String
    },
    itemImageLink: {
        type: String
    }
});


// Put in db1
module.exports = dbs.d1.model('Transaction' , transactionSchema);