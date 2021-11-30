/*
    Author: Abdelrahman Hany
    Created on: 8-Nov-2021
*/

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


// Importing important packages
var passport = require("passport");
var passportLocal = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var passportJWT = require("passport-jwt");


// Importing important files
const config = require("./config");
const authenticate = require("./authenticate");

// Importing DB config
const db = require("./dBconfig");



// Importing Models
const user1Schema = require("./models/user1Schema");
const user2Schema = require("./models/user2Schema");
const inventoryItem1Schema = require("./models/inventoryItem1Schema");
const inventoryItem2Schema = require("./models/inventoryItem2Schema");
const storeItem1Schema = require("./models/storeItem1Schema");
const storeItem2Schema = require("./models/storeItem2Schema");
const transaction1Schema = require("./models/transaction1Schema");
const transaction2Schema = require("./models/transaction2Schema");


// Importing Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/userRouter');
const inventoryRouter = require('./routes/inventoryRouter');
const storeRouter = require('./routes/storeRouter');


// Declaration Zone Ends Here
//-----------------------------------------------------------------------------------------


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// applying passport
app.use(passport.initialize());


// Applying Routers
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use("/api/myinventory", inventoryRouter);
app.use("/api/stores", storeRouter)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
