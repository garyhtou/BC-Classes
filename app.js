require("dotenv").config();
// Check for Firebase Web Config
if (!process.env.FIREBASE_WEB_CONFIG) {
   throw new Error("Missing FIREBASE_WEB_CONFIG in .env");
}

var express = require("express");
var routes = require("./routes");
var bodyParser = require("body-parser");
var fbAdmin = require("./utils/fbAdmin");

// Set Up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use("/", express.static(__dirname + "/public"));

// Router
app.use("/", routes);

//DB for testing
//fbAdmin.addRegistration("asdf", "garytou2@gmail.com");

// tracker
var track = require("./track");

// Start app!
app.listen(80, () => {
   console.log("listening on port 80");
});
