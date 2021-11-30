/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const dbs = require('../dBconfig'); // require only in case of using distributed db


var userSchema = new schema({
    firstName:{
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);

// Put in db1
module.exports = dbs.d1.model('User' , userSchema);

