/*
    Author: Abdelrahman Hany
    Created on: 9-Nov-2021
*/

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const request = require('supertest');
chai.should();
chai.use(chaiHttp);


const USER1 = require("../models/user1Schema");
const USER2 = require("../models/user2Schema");

let token;

describe("Users API Tests", ()=>{
    it("should signup a new user", (done)=>{
        request(server)
        .post('/api/users/signup')
        .send({
            firstName: "test", 
            lastName: "test", 
            username: "testUsername",
            password: "1234",
            email: "sdsds@wsesed.com",
            storeName: "testStoreName"
        })
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("success", true);
            res.body.should.have.property("status", "user registered successfully");
            done();
        });
    });

    it("should log in a registered user", (done)=>{
        request(server)
        .get('/api/users/login')
        .send({
            username: "testUsername",
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

    it("should show the user his/her info", (done)=>{
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
            USER1.findOneAndRemove({username: "testUsername"}).then(()=>{
                USER2.findOneAndRemove({storeName: "testStoreName"}).then(()=>{
                    done();
                });
            });
        });
    });


    it("should show all users if the request sender is an admin", (done)=>{
        request(server)
        .get('/api/users/login')
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


    it("should increase the user's balance from his/her credit card", (done)=>{
        request(server)
        .get('/api/users/login')
        .send({username: "ziad", password: "adminpassword"})
        .end((err, res)=>{
            token = res.body.token;
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
    });

    it("should remove the user's balance to add it to his/her credit card", (done)=>{
        request(server)
        .get('/api/users/login')
        .send({username: "ziad", password: "adminpassword"})
        .end((err, res)=>{
            token = res.body.token;
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

});