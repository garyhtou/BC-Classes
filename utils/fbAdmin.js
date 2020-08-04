// Firebase Admin SDK
var admin = require("firebase-admin");
admin.initializeApp({
   credential: admin.credential.applicationDefault(),
   databaseURL: "https://bc-classes.firebaseio.com",
});

//schema example
var tracking = {
   Fall2020: ["MATH", "ACCT"], //subject slug
   Winter2020: ["ROBI", "ACCT&"],
};

var registrations = [];

class Registration {
   constructor(classID, email) {
      this.classID = classID;
      this.email = email;
   }
}

function addRegistration(idToken, classID, email, callback) {
   callback = callback || function () {};

   //check if missing field
   if (classID == "" || email == "") {
      return callback("Missing field");
   }
   //TODO: check if email and classID is valid.

   for (registration of registrations) {
      //check if already exists
      if (registration.classID == classID && registration.email == email) {
         // result = { message: "Registration already exists" };
         // break;
         return callback("Registration already exists");
      }
   }

   //add to DB
   var postKey = admin
      .database()
      .ref("users/" + idToken.uid)
      .push().key;
   admin
      .database()
      .ref("users/" + idToken.uid + "/" + postKey)
      .update({
         classID: classID,
         email: email,
      });

   registrations.push(new Registration(classID, email));

   callback(null, "success");
}

module.exports.admin = admin;
module.exports.registrations = registrations;
module.exports.addRegistration = addRegistration;
