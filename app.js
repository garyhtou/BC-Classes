require("dotenv").config();
// Check for Firebase Web Config
var requiredEnv = [
	"process.env.GOOGLE_APPLICATION_CREDENTIALS",
	"process.env.FIREBASE_WEB_CONFIG",
	"process.env.EMAIL_HOST",
	"process.env.EMAIL_USER",
	"process.env.EMAIL_PASS",
	"process.env.EMAIL_FROM",
];
for (env of requiredEnv) {
	if (!eval(env)) {
		throw new Error("Missing value in .env: " + env);
	}
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
