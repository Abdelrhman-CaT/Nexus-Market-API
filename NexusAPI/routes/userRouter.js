var express = require('express');
var userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', function(req, res, next) {
  res.json({res:'respond with a resource'});
});

module.exports = userRouter;
