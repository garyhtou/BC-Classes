var cron = require("node-cron");
var request = require("request");

var data = {
   quarters: {},
   classes: {},
};

var publicMethods = {
   getQuarters,
   getClasses,
};

// SCHEDULE
var scheduleMethods = [
   [getQuarters, "0 0 */12 * * *"],
   [getClasses, "0 */15 * * * *"],
];
var x = 0;
var loopScheduler = function (arr) {
   //run method
   arr[x][0](() => {
      //when done,schedule it
      if (cron.validate(arr[x][1])) {
         var script =
            'cron.schedule("' + arr[x][1] + '", ' + arr[x][0] + ").start();";
         eval(script);
      } else {
         throw new Error("Invalid cron for " + arr[x][0]);
      }

      //next method
      x++;
      if (x < arr.length) {
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
      data.quarters = body.NavigationQuarters;
      console.log("got quarters\n" + JSON.stringify(data.quarters));
      callback(null, data.quarters);
   });
}

function getClasses(callback) {
   callback = callback || function () {};

   console.log("getting classes");

   data.classes.quarters = {};

   // get quarter slugs
   data.quarters.map((quarter) => {
      var slug = new String(quarter.FriendlyName).replace(/ /g, "");
      data.classes.quarters[slug] = {};
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
            data.classes.quarters[quarterSlug][subject.Slug] = subject;
         }
         var subjectSlugs = Object.keys(data.classes.quarters[quarterSlug]);

         var loopSubjectCounter = 0;
         var loopSubjects = function (quarterSlug, subjectSlugs) {
            var subjectSlug = subjectSlugs[loopSubjectCounter];

            getSubject(quarterSlug, subjectSlug, (err, courses) => {
               if (err) {
                  console.log("ERROR: GET " + url + "\n" + err);
               }

               data.classes.quarters[quarterSlug][
                  subjectSlug
               ].courses = courses;

               loopSubjectCounter++;
               if (loopSubjectCounter < subjectSlugs.length) {
                  loopSubjects(quarterSlug, subjectSlugs);
               } else {
                  loopQuarterCounter++;
                  if (loopQuarterCounter < quarterSlugs.length) {
                     loopQuarters(quarterSlugs);
                  } else {
                     //console.log(JSON.stringify(data.classes));
                     callback(null, data.classes);
                  }
               }
            });
         };
         loopSubjects(quarterSlug, subjectSlugs);
      });
   };
   loopQuarters(Object.keys(data.classes.quarters));
}

function getSubject(quarterSlug, subjectSlug, callback) {
   callback = callback || function () {};

   var url =
      "https://www2.bellevuecollege.edu/classes/" +
      quarterSlug +
      "/" +
      subjectSlug +
      "?format=json";
   request(url, { json: true }, (err, res, body) => {
      if (err) {
         console.log("ERROR: GET " + url + "\n" + err);
         return callback(err);
      }
      var courses = body.Courses;

      console.log("\ngot " + quarterSlug + " " + subjectSlug + "\n");
      callback(null, courses);
   });
}

// get data without updating
module.exports.data = data;

// update then get data
module.exports.methods = publicMethods;
