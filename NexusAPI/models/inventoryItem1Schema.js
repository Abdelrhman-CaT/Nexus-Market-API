/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dbs = require('../dBconfig'); // require only in case of using distributed db


var inventorySchema = new schema({
    name:{
        type: String
    },
    description: {
        type: String
    },
    imageLink: {
        type: String
    }
});


// Put in db1
module.exports = dbs.d1.model('InventoryItem' , inventorySchema);

