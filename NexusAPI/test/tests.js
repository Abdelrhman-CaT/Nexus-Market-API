const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const request = require('supertest');
chai.should();
chai.use(chaiHttp);


describe("Initial test", ()=>{
    describe("Sign up", ()=>{
        it("should show output", (done)=>{
            request(server)
            .get('/users')
            .end((err, res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("res", "respond with a resource");
                done();
            });
        });
        
        xit("should admin", (done)=>{
            request(server)
            .get('/users/d')
            .end((err, res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("res", "respond with a resource");
                done();
            });
        });

        it("should member", (done)=>{
            request(server)
            .get('/users/b')
            .end((err, res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("res", "respond with a resource");
                done();
            });
        });
    })
});