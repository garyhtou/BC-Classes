var cron = require("node-cron");
var request = require("request");

var data = {
   quarters: {},
   classes: {},
};
var oldData = {
   quarters: {},
   classes: {},
};

// TESTING ONLY!!!!!!
// data.classes = require("../temp");

var publicMethods = {
   getQuarters,
   getClasses,
};

// SCHEDULE
var scheduleMethods = [
   [getQuarters, "0 0 */12 * * *"],
   [getClasses, "0 0 * * * *"],
   [getAllSeats, "0 0 0 * * *"],
];
var loopSchedulerCounter = 0;
var loopScheduler = function (arr) {
   //run method
   arr[loopSchedulerCounter][0](() => {
      //when done,schedule it
      if (cron.validate(arr[loopSchedulerCounter][1])) {
         var script =
            'cron.schedule("' +
            arr[loopSchedulerCounter][1] +
            '", ' +
            arr[loopSchedulerCounter][0] +
            ").start();";
         eval(script);
      } else {
         throw new Error("Invalid cron for " + arr[loopSchedulerCounter][0]);
      }

      //next method
      loopSchedulerCounter++;
      if (loopSchedulerCounter < arr.length) {
         loopScheduler(arr);
      }
   });
};
loopScheduler(scheduleMethods);

// METHODS ---------------------------

function getQuarters(callback) {
   callback = callback || function () {};
   var url = "https://www2.bellevuecollege.edu/classes/All/?format=json";

   request(url, { json: true }, (err, res, body) => {
      if (err) {
         console.log("ERROR: GET " + url + "\n" + err);
         return callback(err);
      }
      oldData.quarters = data.quarters;
      data.quarters = body.NavigationQuarters;
      console.log("got quarters\n" + JSON.stringify(data.quarters));
      callback(null, data.quarters);
   });
}

function getClasses(callback) {
   callback = callback || function () {};

   console.log("getting classes");

   oldData.classes = data.classes;

   var quarters = {};

   // get quarter slugs
   data.quarters.map((quarter) => {
      var slug = new String(quarter.FriendlyName).replace(/ /g, "");
      quarters[slug] = {};
   });

   // get subjects per quarter. using function instead of for loops to be synchronous
   var loopQuarterCounter = 0;
   var loopQuarters = function (quarterSlugs) {
      var quarterSlug = quarterSlugs[loopQuarterCounter];
      var url =
         "https://www2.bellevuecollege.edu/classes/" +
         quarterSlug +
         "/?format=json";
      request(url, { json: true }, (err, res, body) => {
         if (err) {
            console.log("ERROR: GET " + url + "\n" + err);
         }

         var subjects = body.ViewingSubjects;
         for (subject of subjects) {
            //if key for current subject exists in Tracker, save it. (this will cause it to only save tracked subjects)
            quarters[quarterSlug][subject.Slug] = subject;
         }
         var subjectSlugs = Object.keys(quarters[quarterSlug]);

         var loopSubjectCounter = 0;
         var loopSubjects = function (quarterSlug, subjectSlugs) {
            var subjectSlug = subjectSlugs[loopSubjectCounter];

            getSubject(quarterSlug, subjectSlug, (err, courses) => {
               if (err) {
                  console.log("ERROR: GET " + url + "\n" + err);
               }

               quarters[quarterSlug][subjectSlug].Courses = courses;

               // Save data!
               data.classes.quarters = quarters;

               loopSubjectCounter++;
               if (loopSubjectCounter < subjectSlugs.length) {
                  loopSubjects(quarterSlug, subjectSlugs);
               } else {
                  loopQuarterCounter++;
                  if (loopQuarterCounter < quarterSlugs.length) {
                     loopQuarters(quarterSlugs);
                  } else {
                     //console.log(JSON.stringify(data.classes));

                     // not necessary, but make sure everything's save before call back
                     data.classes.quarters = quarters;
                     callback(null, data.classes);
                  }
               }
            });
         };
         loopSubjects(quarterSlug, subjectSlugs);
      });
   };
   loopQuarters(Object.keys(quarters));
}

function getSubject(quarterSlug, subjectSlug, callback) {
   callback = callback || function () {};

   var url =
      "https://www2.bellevuecollege.edu/classes/" +
      quarterSlug +
      "/" +
      subjectSlug +
      "?format=json";
   request(url, { "content-type": "text/plain" }, (err, res, body) => {
      if (err) {
         console.log("ERROR: GET " + url + "\n" + err);
         return callback(err);
      }
      // remove duplicate "ID" key >:(
      // potential cause?: https://github.com/BellevueCollege/ClassSchedule/blob/83805ce9dea840c8a2e85cc8cd7a30d54125d436/ClassSchedule.Web/Models/SectionWithSeats.cs#L17
      var raw = body.toString().replace(/"ID":null,/g, "");
      var json = JSON.parse(raw);
      var rawSubject = json.Courses;

      // process data
      var courses = {};
      for (rawCourse of rawSubject) {
         var course = {};

         course.CourseID = rawCourse.Sections[0].CourseID;
         course.CourseTitle = rawCourse.Sections[0].CourseTitle;

         course.Sections = {};
         for (section of rawCourse.Sections) {
            course.Sections[section.ID.ItemNumber] = section;
         }

         // add to list of courses
         courses[course.CourseID] = course;
      }

      console.log("\ngot " + quarterSlug + " " + subjectSlug + "\n");
      callback(null, courses);
   });
}

function updateSeats(ItemNumber, quarterID, callback) {
   callback = callback || function () {};

   var url = "https://www2.bellevuecollege.edu/classes/Api/GetSeats";
   var classID = { classID: ItemNumber + quarterID };
   request.post({ url: url, json: classID }, function (err, response, body) {
      if (err) {
         console.log(err);
         return callback(err);
      }
      var seats = parseInt(body.split("|")[0]);
      console.log(
         "Seats for " + ItemNumber + " of " + quarterID + ": " + seats
      );
      callback(null, seats);
   });
}

function getAllSeats(callback) {
   var queue = [];

   for (quarter in data.classes.quarters) {
      var quarterObject = data.classes.quarters[quarter];
      for (subject in quarterObject) {
         var subjectObject = quarterObject[subject];
         for (courses in subjectObject.Courses) {
            var sectionObject = subjectObject.Courses[courses].Sections;
            for (section in sectionObject) {
               var indivSectionObject = sectionObject[section];

               // synchronous
               queue.push([
                  indivSectionObject.ID.ItemNumber,
                  indivSectionObject.ID.YearQuarter,
               ]);

               // asynchronous
               // updateSeats(section.ID.ItemNumber, section.ID.YearQuarter);
            }
         }
      }
   }

   var loopSeatsCounter = 0;
   var loopSeats = function (classes) {
      updateSeats(
         classes[loopSeatsCounter][0],
         classes[loopSeatsCounter][1],
         function () {
            loopSeatsCounter++;
            if (loopSeatsCounter < classes.length) {
               loopSeats(classes);
            } else {
               callback();
            }
         }
      );
   };
   loopSeats(queue);
}

// get data without updating
module.exports.data = data;

// update then get data
module.exports.methods = publicMethods;
