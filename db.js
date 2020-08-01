//temp before connect to db

var registrations = [];

class Registration {
   constructor(classID, email) {
      this.classID = classID;
      this.email = email;
   }
}

function addRegistration(classID, email, callback) {
   var exists = false;

   for (registration of registrations) {
		console.log("CHECKING: " + JSON.stringify(registration));
      if (registration.classID == classID && registration.email == email) {
         exists = true;
         break;
      }
   }

   if (!exists) {
      registrations.push(new Registration(classID, email));
   }

   if (typeof callback === "function") {
      if (!exists) {
         callback({ result: "successful" });
      } else {
         callback({ result: "Registration already exists" });
      }
   }
}

exports.registrations = registrations;
exports.addRegistration = addRegistration;
