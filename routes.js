var routes = require("express").Router();
var fbAdmin = require("./utils/fbAdmin");

var bcAPI = require("./utils/bcAPI");
var track = require("./track");

routes.get("/", function (req, res) {
   res.render("home", { registrations: fbAdmin.getRegistrations() });
});

routes.get("/data", function (req, res) {
   res.json(bcAPI.getData());
});

routes.get("/olddata", function (req, res) {
   res.json(bcAPI.getOldData());
});

routes.get("/changes", function (req, res) {
   res.json(track.getChanges());
});

routes.get("/history", function (req, res) {
   res.json(track.getChangeHistory());
});

routes.post("/register", validateAuth, function (req, res) {
   var idToken = req.currentUser;
   console.log("\n\nVALID idToken: " + JSON.stringify(idToken) + "\n\n");

   var data = {};
   data.quarter = req.body.quarter;
   data.subject = req.body.subject;
   data.course = req.body.course;
   data.section = req.body.secton;
   data.instructor = req.body.instructor;
	data.seats = req.body.seats;
	console.log(req.body);

   fbAdmin.addRegistration(idToken, data, (err, data) => {
      if (err) {
         res.status(400).send(err);
         console.log(err);
      } else {
         res.status(200).send(data);
         console.log(data);
      }
   });
});

routes.get("/login", function (req, res) {
   res.render("login");
});

routes.all("*", function (req, res) {
   var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
   console.log("404 - " + fullUrl);
   res.status(404).render("404.ejs");
});

// MIDDLEWARE --------------------------------

function validateAuth(req, res, next) {
   var authHeader = req.headers.authorization;
   if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1];
      //console.log(idToken);

      fbAdmin.admin
         .auth()
         .verifyIdToken(idToken)
         .then(function (decodedToken) {
            let uid = decodedToken.uid;
            req["currentUser"] = decodedToken;
            next();
         })
         .catch(function (err) {
            console.log(err);
            var message = "Invalid Token";
            res.status(403).send(message);
            console.log(message);
         });
   } else {
      var message = "You be signed in.";
      res.status(403).send(message);
      console.log(message);
   }
}

module.exports = routes;
