/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dbs = require('../dBconfig'); // require only in case of using distributed db


var storeItemSchema = new schema({
    sellAmount:{
        type: Number,
        min: 0
    },
    sellPrice: {
        type: Number,
        min: 0
    }
});


// Put in db1
module.exports = dbs.d1.model('StoreItem' , storeItemSchema);