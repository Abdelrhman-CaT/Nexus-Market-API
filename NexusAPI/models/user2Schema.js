/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const user1Schema = require("./user1Schema");
const dbs = require('../dBconfig'); // require only in case of using distributed db


var userSchema = new schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: user1Schema
    },
    balance:{
        type: Number,
        default: 0
    },
    storeName: {
        type: String
    }
});


// Put in db2
module.exports = dbs.d2.model('User' , userSchema);

