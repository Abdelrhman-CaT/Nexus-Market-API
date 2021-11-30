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

describe("Users API Tests", ()=>{
    describe("Sign up", ()=>{
        it("should show signup a new user", (done = ()=>{
            USER1.findOneAndRemove({username: "testUsername"}).then(()=>{
                USER2.findOneAndRemove({storeName: "testStoreName"});
            })
        })=>{
            request(server)
            .post('/api/users/signup')
            .send({
                firstName: "test", 
                lastName: "test", 
                userName: "testUsername",
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
    })
});