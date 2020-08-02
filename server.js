var express = require("express");
var routes = require("./routes");
var bodyParser = require("body-parser");
var db = require("./db");

// Set Up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use("/assets", express.static(__dirname + "/assets"));

// Router
app.use("/", routes);

//DB for testing
db.addRegistration("asdf", "garytou2@gmail.com");

// BC-API
var bcAPI = require("./bcAPI");

// Start app!
app.listen(3000, () => {
   console.log("listening on port 3000");
});
