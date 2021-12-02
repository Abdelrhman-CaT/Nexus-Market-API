/*
    Author: Abdelrahman Hany
    Created on: 30-Nov-2021
*/

var mongoose = require("mongoose");

const USER1 = require("./models/user1Schema");
const USER2 = require("./models/user2Schema");
const INV1 = require("./models/inventoryItem1Schema");
const INV2 = require("./models/inventoryItem2Schema");
const STR1 = require("./models/storeItem1Schema");
const STR2 = require("./models/storeItem2Schema");
const TRAN1 = require("./models/transaction1Schema");
const TRAN2 = require("./models/transaction2Schema");



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


exports.checkQuery = (Qname)=>{
    return (req, res, next)=>{
        if(req.query[Qname]){
            let test = req.query[Qname]
            // if the string contains only spaces, it is rejected
            if (test.replace(/\s/g, '').length) { // replace space with empty string then measure its length
                return next();
            }
            else{
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.json({
                    success: false,
                    status: "invalid query"
                });
            }
        }
        else{
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: false,
                status: "invalid query"
            });
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

/*
exports.checkPersonalAvailabilityIdParam = (collection, param)=>{
    return (req, res, next)=>{
        collection.findOne({_id: mongoose.Types.ObjectId(req.params[param]), owner: req.user._id}).then((result)=>{
            if(result == null){
                let name = param.substring(0, param.length-2);
                let collectionName = (collection == INV2)?"inventory":"store"; 
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: `${name} doesn't exist in your ${collectionName}`});
            }
            else{
                return next();
            }
        })
        .catch((err)=>{
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
        });
    }
}
*/
/*
exports.checkGeneralAvailabilityIdParam = (collection, param)=>{
    return (req, res, next)=>{
        collection.findOne({_id: mongoose.Types.ObjectId(req.params[param])}).then((item)=>{
            if(item == null){
                let name = param.substring(0, param.length-2);
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: `${name} doesn't exist`});
            }
            else{
                return next();
            }
        })
        .catch((err)=>{
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
        });
    }
}
*/

exports.checkNumbersValidity = (...fields)=>{
    return (req, res, next)=>{
        let mark = true;
        for(field of fields){
            if(!((typeof(req.body[field] == "number") && req.body[field] > 0) || req.body[field] == null)){
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
                  let user2 = new USER2({
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
        let inv1 = new INV1({
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
                res.json({ success: true, status: "item added successfully", id: inv2._id});
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
    else if(collection == "STR"){
        let str1Item = new STR1({
            sellAmount: req.body.amount,
            sellPrice: req.body.price 
        });
        str1Item.save().then((str1i)=>{
            let str2Item = new STR2({
                _id: mongoose.Types.ObjectId(str1i._id),
                item: mongoose.Types.ObjectId(req.params.itemId),
                owner: mongoose.Types.ObjectId(req.user._id)
            });
            str2Item.save().then((item)=>{
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: true, status: "item added successfully to your store", id: item._id});
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
            })
        })
        .catch((err)=>{
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: false, status: "process failed", err: {name: err.name, message: err.message} });
        });
    }

}





exports.purchase = (item, seller, buyer, req, res)=>{
    // 1- decrease buyer's balance and increase seller's balance
    let p = item._id.sellPrice;
    buyer.balance -= p;
    buyer.save().then((b)=>{
        seller.balance += p;
        seller.save().then((s)=>{
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "purchased", buyer: b, seller: s});
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
