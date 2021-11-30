/*
    Author: Abdelrahman Hany
    Created on: 8-Nov-2021
*/

var express = require('express');
var index = express.Router();
var cors = require("../cors");

index.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});

/* GET home page. */
index.get('/', cors.corsWithOptions, function(req, res, next) {
  res.render('index', { title: 'Deployed Successfully' });
});

module.exports = index;
