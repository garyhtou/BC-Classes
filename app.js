require("dotenv").config();
// Check for required env
if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
	throw new Error(
		"Missing value in .env: process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT"
	);
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
var path = require("path");

// Set Up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use("/", express.static(__dirname + "/react-frontend/build"));
app.use("/", express.static(__dirname + "/public"));

// firebase
var fbAdmin = require("./utils/fbAdmin");
fbAdmin.updateRegistrations();

// email
var email = require("./utils/email");

// tracker
var track = require("./track");

// bcAPI
var bcAPI = require("./utils/bcAPI");
bcAPI.update.setDataOnStart();

// Router
var routes = require("./routes");
app.use("/", routes);

// Start app!
const port = process.env.PORT || 80;
app.listen(port, () => {
	console.log("listening on port " + port);
	console.log("Current time: " + new Date().toLocaleString());
});

// no need to visit /ping. This presets the self ping URL
// var forceSelfPingURL = "https://bc.garytou.com/ping";
// if (forceSelfPingURL) {
// 	var selfPing = require("./selfPing");
// 	selfPing.ping(forceSelfPingURL);
// }
