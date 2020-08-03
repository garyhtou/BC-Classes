require("dotenv").config();
var express = require("express");
var routes = require("./routes");
var bodyParser = require("body-parser");
var fbAdmin = require("./fbAdmin");

// Set Up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use("/assets", express.static(__dirname + "/assets"));

// Router
app.use("/", routes);

//DB for testing
fbAdmin.addRegistration("asdf", "garytou2@gmail.com");

// BC-API
var bcAPI = require("./bcAPI");

// Check for Firebase Web Config
if (!process.env.FIREBASE_WEB_CONFIG) {
   throw new Error("Missing FIREBASE_WEB_CONFIG in .env");
}

// Start app!
app.listen(3000, () => {
   console.log("listening on port 3000");
});
