'use strict';
var express = require("express");
var app = express();

// init Routing
app.use("/user", require("../routes/user.router"));
app.use("/auth", require("../routes/auth.router"));
app.use("/category", require("../routes/category.router"));
app.use("/music", require("../routes/music.router"));

module.exports = app;
