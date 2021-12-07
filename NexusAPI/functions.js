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
        return new Promise((resolve, reject)=>{
            let inv1 = new INV1({
                name: fields[0],
                description: fields[1],
                imageLink: fields[2]
            });
            inv1.save().then((inv1)=>{
                inv2 = new INV2({
                    _id: mongoose.Types.ObjectId(inv1._id),
                    owner: mongoose.Types.ObjectId(fields[3]),
                    amount: fields[4],
                    price: fields[5]
                });
                inv2.save().then((inv2)=>{
                    resolve(inv2._id);
                })
                .catch((err)=>{
                    reject(err);
                });
            })
            .catch((err)=>{
                reject(err);
            })
        });
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
    else if(collection == "TRANS"){
        /*
            this.distribute("TRANS", null, null, item.item.name, item.item.imageLink, 
            amount, p*amount, buyer._id, seller._id); 
        */
        return new Promise((resolve, reject)=>{
            let t = new TRAN1({
                itemName: fields[0],
                itemImageLink: fields[1],
                amount: fields[2],
                price: fields[3]
            });
            t.save().then((t1)=>{
                let t2 = new TRAN2({
                    _id: mongoose.Types.ObjectId(t1._id),
                    buyer: mongoose.Types.ObjectId(fields[4]),
                    seller: mongoose.Types.ObjectId(fields[5])
                });
                t2.save().then(()=>{
                    resolve();
                })
                .catch((err)=>{
                    reject(err);
                });
            })
           .catch((err)=>{
                reject(err);
            });
        });
    }
}



const createInvItemForBuyer = (buyer, seller, item, amount, p)=>{
    return new Promise((resolve, reject)=>{
        //------------------------------------------------------------------
        // 3- create a new inventory item for the buyer
        INV2.find({owner: mongoose.Types.ObjectId(buyer._id)}).populate("_id").then((buyerInv)=>{
            let mark = false;
            let id;
            for(invItem of buyerInv){
                if(invItem._id.name == item.item.name && invItem._id.description && invItem._id.imageLink == item.item.imageLink){
                    mark = true;
                    id = invItem._id._id;
                    break;
                }
            }
            if(mark == true){
                INV2.findByIdAndUpdate(id, {$inc:{amount: amount}}).then(()=>{
                    //------------------------------------------------------------------
                    // 4- create a new transaction to record the sale
                    this.distribute("TRANS", null, null, item.item.name, item.item.imageLink, 
                    amount, p*amount, buyer._id, seller._id).then(()=>{
                        resolve(id);
                    })
                    .catch((err)=>{
                        reject(err);
                    });
                    //------------------------------------------------------------------
                })
                .catch((err)=>{
                    reject(err);
                });
            }
            else{
                this.distribute("INV", null, null, item.item.name, item.item.description, item.item.imageLink, buyer._id,
                amount, p).then((itemId)=>{
                    //------------------------------------------------------------------
                    // 4- create a new transaction to record the sale
                    this.distribute("TRANS", null, null, item.item.name, item.item.imageLink, 
                    amount, p*amount, buyer._id, seller._id).then(()=>{
                        resolve(itemId);
                    })
                    .catch((err)=>{
                        reject(err);
                    });
                    //------------------------------------------------------------------
                })
                .catch((err)=>{
                    reject(err);
                });
            }
        })
        .catch((err)=>{
            reject(err);
        });
        //------------------------------------------------------------------
    });
}


exports.purchase = (item, seller, buyer, amount, done)=>{
    return new Promise((resolve, reject)=>{
        // 1- decrease buyer's balance and increase seller's balance
        let p = item._id.sellPrice;
        buyer.balance -= p * amount;
        buyer.save().then((b)=>{
            seller.balance += p;
            seller.save().then((s)=>{
                //---------------------------------------------------------------------------------
                // 2- decrease the sellAmount of the storeItem and delete it if the amount reached zero
                if(item._id.sellAmount == amount){
                    STR1.findByIdAndDelete(item._id._id).then(()=>{
                        STR2.findByIdAndDelete(item._id._id).then(()=>{
                            INV2.findById(item.item).then((i)=>{
                                if(i.amount == amount){
                                    INV1.findByIdAndDelete(i._id).then(()=>{
                                        i.remove().then(()=>{
                                            //res.json({state: "removed from inv and str"});
                                            done();
                                            createInvItemForBuyer(buyer, seller, item, amount, p).then((id)=>{
                                                resolve(id);
                                            })
                                            .catch((err)=>{
                                                reject(err);
                                            });
                                        })
                                        .catch((err)=>{
                                            reject(err);
                                        });
                                    })
                                    .catch((err)=>{
                                        reject(err);
                                    })
                                }
                                else{
                                    i.amount -= amount;
                                    i.save().then(()=>{
                                        //res.json({state: "removed from str. inv item decremented by " + amount});
                                        done();
                                        createInvItemForBuyer(buyer, seller, item, amount, p).then((id)=>{
                                            resolve(id);
                                        })
                                        .catch((err)=>{
                                            reject(err);
                                        })
                                    })
                                    .catch((err)=>{
                                        reject(err);
                                    });
                                }
                            })
                        })
                        .catch((err)=>{
                            reject(err);
                        });
                    })
                    .catch((err)=>{
                        reject(err);
                    });
                }
                else{
                    STR1.findOneAndUpdate({_id: item._id._id}, {$inc:{sellAmount: -1 * amount}}).then((s)=>{
                        INV2.findOneAndUpdate({_id: item.item}, {$inc:{amount: -1 * amount}}).then((i)=>{
                            //res.json({state: "inv item decremented by " + amount + " alse the str item amount is decremented"});
                            done();
                            createInvItemForBuyer(buyer, seller, item, amount, p).then((id)=>{
                                resolve(id);
                            })
                            .catch((err)=>{
                                reject(err);
                            })
                        })
                        .catch((err)=>{
                            reject(err);
                        });
                    })
                    .catch((err)=>{
                        reject(err);
                    });
                }
            })
            .catch((err)=>{
                reject(err);
            });
        })
        .catch((err)=>{
            reject(err);
        });
    });
}
