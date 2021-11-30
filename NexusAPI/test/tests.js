/*
    Author: Abdelrahman Hany
    Created on: 9-Nov-2021
*/

const mongoose = require("mongoose");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const request = require('supertest');
chai.should();
chai.use(chaiHttp);


const USER1 = require("../models/user1Schema");
const USER2 = require("../models/user2Schema");
const INV1 = require("../models/inventoryItem1Schema");
const INV2 = require("../models/inventoryItem2Schema");

let token;
let itemId;  // needs to be reassgined beginning from testing store api

describe("Users API Tests", ()=>{
    it("should sign me up", (done)=>{
        request(server)
        .post('/api/users/signup')
        .send({
            firstName: "test", 
            lastName: "test", 
            username: "npmTestingUserName",
            password: "1234",
            email: "sdsds@wsesed.com",
            storeName: "npmTestingStoreName"
        })
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "user registered successfully");
            done();
        });
    });

    it("should log me in", (done)=>{
        request(server)
        .post('/api/users/login')
        .send({
            username: "npmTestingUserName",
            password: "1234"
        })
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "user login successfully");
            res.body.should.have.property("token");
            token = res.body.token;
            done();
        });
    });

    it("should show me my info", (done)=>{
        request(server)
        .get('/api/users/profile')
        .set("Authorization", `bearer ${token}`)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("success", true);
            res.body.should.have.property("user");
            res.body.user.should.be.a("object");
            res.body.user.should.have.property("id");
            res.body.user.should.have.property("firstName");
            res.body.user.should.have.property("lastName");
            res.body.user.should.have.property("balance");
            
            // Removing data used in the test
            USER1.findOneAndRemove({username: "npmTestingUserName"}).then(()=>{
                USER2.findOneAndRemove({storeName: "npmTestingStoreName"}).then(()=>{
                    done();
                });
            });
        });
    });


    it("should show me all users (I am an admin)", (done)=>{
        request(server)
        .post('/api/users/login')
        .send({username: "ziad", password: "adminpassword"})
        .end((err, res)=>{
            token = res.body.token;
            request(server)
            .get("/api/users")
            .set("Authorization", `bearer ${token}`)
            .end((err, res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("success", true);
                res.body.should.have.property("users");
                res.body.users.should.be.a("array");
                done();
            });
        });
    });


    it("should increase my balance from my credit card", (done)=>{
        request(server)
        .put("/api/users/wallet/deposit")
        .send({cardNum: "xx", cvv: "xx", amount: 40})
        .set("Authorization", `bearer ${token}`)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "balance added successfully");
            done();
        }); 
    });

    it("should remove my balance to add it to my credit card", (done)=>{
        request(server)
        .put("/api/users/wallet/withdraw")
        .send({cardNum: "xx", cvv: "xx", amount: 40})
        .set("Authorization", `bearer ${token}`)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "balance removed successfully");
            done();
        });
    });

});


describe("Inventory API Tests", ()=>{
    it("should add an item to my inventory", (done)=>{
        request(server)
        .post("/api/myinventory")
        .set("Authorization", `bearer ${token}`)
        .send({
            "name": "npmTestingItem",
            "price": 30,
            "amount": 10,
            "description": "npmTestingDescription",
            "imageLink": "npmTestinglink"
        })
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "item added successfully");
            
            INV1.findOne({name: "npmTestingItem"}).then((item)=>{
                itemId = item._id;
                done();
            });
        });
    });

    it("should get all items in my inventory", (done)=>{
        request(server)
        .get("/api/myinventory")
        .set("Authorization", `bearer ${token}`)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("success", true);
            res.body.should.have.property("items");
            res.body.items.should.be.a("array");
            res.body.items[0].should.be.a("object");
            res.body.items[0].should.have.property("id");
            res.body.items[0].should.have.property("name");
            res.body.items[0].should.have.property("amount");
            res.body.items[0].should.have.property("price");
            res.body.items[0].should.have.property("imageLink");
            res.body.items[0].should.have.property("description");
            done();
        });
    });

    it("should get info about a specific item given its id in my inventory", (done)=>{
        request(server)
        .get(`/api/myinventory/${itemId}`)
        .set("Authorization", `bearer ${token}`)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("success", true);
            res.body.should.have.property("item");
            res.body.item.should.be.a("object");
            res.body.item.should.have.property("id");
            res.body.item.should.have.property("name");
            res.body.item.should.have.property("amount");
            res.body.item.should.have.property("price");
            res.body.item.should.have.property("imageLink");
            res.body.item.should.have.property("description");
            done();
        });
    });

    it("should edit the info of a specific item given its id in my inventory", (done)=>{
        request(server)
        .put(`/api/myinventory/${itemId}`)
        .set("Authorization", `bearer ${token}`)
        .send({name: "npmTestingItemMod"})
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "item edited successfully");
            done();
        });
    });


    it("should delete a specific item given its id from my inventory", (done)=>{
        request(server)
        .delete(`/api/myinventory/${itemId}`)
        .set("Authorization", `bearer ${token}`)
        .send({name: "npmTestingItemMod"})
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "item deleted successfully");
            done();
        });
    });

});


describe("Store API Tests", ()=>{
    it("should get all items in my store", (done)=>{
        request(server)
        .get("/api/stores/mystore")
        .set("Authorization", `bearer ${token}`)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("success", true);
            res.body.should.have.property("items");
            res.body.items.should.be.a("array");
            done();
        });
    });
});