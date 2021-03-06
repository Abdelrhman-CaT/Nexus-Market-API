/*
    Author: Abdelrahman Hany
    Created on: 8-Nov-2021
*/

var Mongoose = require("mongoose");
const config = require("./config");

// For distributed db

try{
    exports.d1 = Mongoose.createConnection(process.env.DB1 || process.env.TESTDB1 || config.local);
    //console.log("Connected to DB 1");
  }
  catch(err){
    console.log(err);
  }
  
  try{
    exports.d2 = Mongoose.createConnection(process.env.DB2 || process.env.TESTDB2 || config.local);
    //console.log("Connected to DB 2");
  }
  catch(err){
    console.log(err);
  }



// For monolithic db
/*
const url = config.offlineDbUrl;
exports.connect = Mongoose.connect(url).then((db) => {
    console.log("DB Connected Successfully!");
  })
  .catch((err) => {
    console.log(err);
  });
*/
  
