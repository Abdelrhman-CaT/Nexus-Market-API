/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var mongoose = require("mongoose");

const USER1 = require("./models/user1Schema");
const USER2 = require("./models/user2Schema");
const INV1 = require("./models/inventoryItem1Schema");
const INV2 = require("./models/inventoryItem2Schema");


exports.checkForRequiredFields = (...fields)=>{
    return (req, res, next)=>{
        let mark = true;
        for(field of fields){
            if(!req.body.hasOwnProperty(field)){
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.json({
                    success: false,
                    status: "a required field is missing"
                });
                mark = false;
                break;
            }
        }
        if(mark){
            return next();
        }
    }
}


exports.checkUniqueness = (collection, keyDb, keyReq)=>{
    return (req, res, next)=>{
        let query = {};
        query[keyDb] = req.body[keyReq];
        collection.find(query).then((result)=>{
            if(result.length == 0){
                return next();
            }
            else{
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json");
                res.json({
                    success: false,
                    status: `${keyReq} already exists` 
                });
            }
        })
    }
}


exports.checkNumbersValidity = (...fields)=>{
    return (req, res, next)=>{
        let mark = true;
        for(field of fields){
            if(!(typeof(req.body[field] == "number") && req.body[field] >= 0)){
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.json({success: false, status: `invalid ${field}`});
                mark = false;
                break;
            }
        }
        if(mark){
            return next();
        }
    }
}


exports.distribute = (collection, req, res, ...fields) => {
    // CREATING USERS
    if(collection == "USER"){
        // creating a document for the user in USER1
        USER1.register(
            new USER1({
              username: req.body.username,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email : req.body.email,
              phoneNumber: (req.body.phoneNumber)?req.body.phoneNumber : ""
            }),
            req.body.password,
            (err, user1)=>{
              if(err){
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
              }
              else{
                user1.save()
                .then((user1)=>{
                  // Document created successfully in USER1 and now creating a document for the user in USER2
                  user2 = new USER2({
                    _id: mongoose.Types.ObjectId(user1._id),
                    storeName: req.body.storeName
                  });
                  user2.save()
                  .then((user2)=>{
                    // Document created successfully in USER2 and now sending responses for best case
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ success: true, status: "user registered successfully" });
                  })
                  .catch((err)=>{
                      res.statusCode = 500;
                      res.setHeader("Content-Type", "application/json");
                      res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                  });
                })
                .catch((err)=>{
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
                });
              }
            }
        );
    }
    else if(collection == "INV"){
        inv1 = new INV1({
            name: req.body.name,
            description: req.body.description,
            imageLink: req.body.imageLink
        });
        inv1.save().then((inv1)=>{
            inv2 = new INV2({
                _id: mongoose.Types.ObjectId(inv1._id),
                owner: mongoose.Types.ObjectId(req.user._id),
                amount: req.body.amount,
                price: req.body.price
            });
            inv2.save().then((inv2)=>{
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: true, status: "item added successfully"});
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
            });
        })
        .catch((err)=>{
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
        })
    }


}