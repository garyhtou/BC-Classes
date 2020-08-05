var bcAPI = require("./bcAPI");

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

function addRegistration(idToken, data, callback) {
   callback = callback || function () {};
   console.log("addRegistration()\n" + JSON.stringify(data));

   if (data.section == undefined) {
      data.section = "";
   }

   var quarter = data.quarter;
   var subject = data.subject;
   var course = data.course;
   var section = data.section;
   var instructor = data.instructor.toString();
   var seats = data.seats.toString();

   //check if missing field
   if (
      quarter == "" ||
      subject == "" ||
      course == "" ||
      (section != "" && (instructor == "" || seats == ""))
   ) {
      return callback("Missing field");
   } else if (
      !(instructor == "true" || instructor == "false") ||
      !(seats == "true" || seats == "false")
   ) {
      return callback("Invalid boolean");
   }

   data.instructor = data.instructor == "true" ? true : false;
   data.seats = data.seats == "true" ? true : false;

   //valid fields
   if (!Object.keys(bcAPI.getData().quarters).includes(quarter)) {
      return callback('Invalid field. Quarter "' + quarter + '" not found');
   } else if (
      !Object.keys(bcAPI.getData().classes.quarters[quarter]).includes(subject)
   ) {
      return callback('Invalid field. Subject "' + subject + '" not found');
   } else if (
      !Object.keys(
         bcAPI.getData().classes.quarters[quarter][subject].Courses
      ).includes(course)
   ) {
      return callback('Invalid field. Course "' + course + '" not found');
   } else if (section != "") {
      if (
         !Object.keys(
            bcAPI.getData().classes.quarters[quarter][subject].Courses[course]
               .Sections
         ).includes(section)
      ) {
         return callback('Invalid field. Section "' + section + '" not found');
      }
   }

   //check if already exists
   if (registrations != null) {
      var currUserRegs = registrations[idToken.uid];
      console.log(currUserRegs);
      for (registration in currUserRegs) {
         var match = 0;
         for (field in currUserRegs[registration]) {
            if (
               field != "time" &&
               currUserRegs[registration][field] == data[field]
            ) {
               //don't compare registration time
               match++;
            }
         }
         if (match == Object.keys(currUserRegs[registration]).length - 1) {
            // -1 for time field
            return callback("Registration already exists");
         }
      }
   } else {
      console.log("REGISTRATIONS FROM FIREBASE IS NULL!");
   }

   //add to DB
   data.time = admin.database.ServerValue.TIMESTAMP;
   console.log(data);
   admin
      .database()
      .ref("registrations/" + idToken.uid)
      .push(data);

   callback(null, "success");
}

//get registrations
function updateRegistrations() {
   admin
      .database()
      .ref("registrations")
      .on("value", (snapshot) => {
         registrations = snapshot.val();
         console.log("REGISTRATIONS:" + JSON.stringify(registrations));
      });
}
updateRegistrations();
function getRegistrations() {
   return registrations;
}


function addChanges(changes) {
   var data = {};
   data.time = admin.database.ServerValue.TIMESTAMP;
   data.changes = {};
   data.changes = changes;

   admin.database().ref("changes/").push(data);
}

module.exports.admin = admin;
module.exports.getRegistrations = getRegistrations;
module.exports.addRegistration = addRegistration;
module.exports.addChanges = addChanges;
