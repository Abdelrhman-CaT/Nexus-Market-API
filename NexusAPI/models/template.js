/*
    Author: Abdelrahman Hany
    Created on: 8-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

//const db = require('../dBconfig'); // require only in case of using distributed db


// designing schemas
/*
var userSchema = new schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library"
    },
    member:{
        type: Boolean,
        default: false
    }
});
*/

// applying the schema to the DB
/*
// for distributed db:
module.exports = db.firstdatabase.model('User' , userSchema);
*/
/*
// for monolithic db:
module.exports = mongoose.model('User', userSchema);
*/
