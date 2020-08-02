var routes = require("express").Router();
var db = require("./db");

routes.get("/", function (req, res) {
   var data = {
      data: db.registrations,
   };

   res.render("home", { data: data });
});

routes.get("/data", function (req, res) {
	var bcAPI = require("./bcAPI");
	res.json(bcAPI.data);
});

routes.post("/register", function (req, res) {
   console.log(req.body);
   db.addRegistration(req.body.classID, req.body.email, (err, data) => {
      if (err) {
         res.status(400).send(err);
         // res.send(400, err);
         console.log(err);
      } else {
         res.status(200).send(data);
         console.log(data);
      }
   });
});

module.exports = routes;
