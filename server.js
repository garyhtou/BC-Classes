var express = require("express");
var bodyParser = require('body-parser')
var db = require("./db.js");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Set Up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());

//DB for testing
db.addRegistration("asdf", "garytou2@gmail.com");


//Routes
app.get("/", function (req, res) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.open(
      "GET",
      "https://www2.bellevuecollege.edu/classes/Fall2020/?format=json",
      false
   ); // false for synchronous request
   xmlHttp.send(null);

   var data = {
      data: JSON.stringify(JSON.parse(xmlHttp.responseText)),
   };

   res.render("home", { data: data });
});

app.get("/json", function (req, res) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.open(
      "GET",
      "https://www2.bellevuecollege.edu/classes/Fall2020/?format=json",
      false
   ); // false for synchronous request
   xmlHttp.send(null);

   res.json(JSON.parse(xmlHttp.responseText));
});

app.post("/register", function (req, res) {
   console.log(req.body);
   db.addRegistration(req.body.classID, req.body.email, (result) => {
		console.log(result);
      if (result.result == "successful") {
         res.status(200).json(result);
      } else {
         res.status(409).json(result);
      }
      console.log(JSON.stringify(db.registrations));
   });
});



// Start app!
app.listen(3000, () => {
   console.log("listening on port 3000");
});
