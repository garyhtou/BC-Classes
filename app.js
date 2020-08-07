require("dotenv").config();
// Check for required env
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
	throw new Error("Missing value in .env: process.env.GOOGLE_APPLICATION_CREDENTIALS");
}
if (!process.env.FIREBASE_WEB_CONFIG) {
	throw new Error("Missing value in .env: process.env.FIREBASE_WEB_CONFIG");
}
if (!process.env.EMAIL_HOST) {
	throw new Error("Missing value in .env: process.env.EMAIL_HOST");
}
if (!process.env.EMAIL_USER) {
	throw new Error("Missing value in .env: process.env.EMAIL_USER");
}
if (!process.env.EMAIL_PASS) {
	throw new Error("Missing value in .env: process.env.EMAIL_PASS");
}
if (!process.env.EMAIL_FROM) {
	throw new Error("Missing value in .env: process.env.EMAIL_FROM");
}



var express = require("express");
var bodyParser = require("body-parser");

// Set Up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use("/", express.static(__dirname + "/public"));

// firebase
var fbAdmin = require("./utils/fbAdmin");
fbAdmin.updateRegistrations();

// email
var email = require("./email");

// tracker
var track = require("./track");

// Router
var routes = require("./routes");
app.use("/", routes);

// Start app!
app.listen(80, () => {
	console.log("listening on port 80");
});
