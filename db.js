//temp before connect to db

var registrations = [];

class Registration {
   constructor(classID, email) {
      this.classID = classID;
      this.email = email;
   }
}

function addRegistration(classID, email, callback) {
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
   registrations.push(new Registration(classID, email));

   callback(null, "success");
}

module.exports.registrations = registrations;
module.exports.addRegistration = addRegistration;
