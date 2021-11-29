var express = require('express');
var userRouter = express.Router();
var cors = require("../cors");

/* GET users listing. */

userRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});


userRouter.get('/', function(req, res, next) {
  res.json({res:'respond with a resource'});
});



module.exports = userRouter;
