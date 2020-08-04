var cron = require("node-cron");
var bcAPI = require("./utils/bcAPI");

// SCHEDULE
var scheduleMethods = [
   [bcAPI.methods.getQuarters, "0 0 */12 * * *"],
   [findChanges, "0 0 * * * *"],
   // [bcAPI.methods.getAllSeats, "0 0 0 * * *"],
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

// METHODS -----------------

const actionAdded = "added";
const actionRemoved = "removed";

function findChanges() {
   //FOFMRAT:
   // Everything should be friendly values
   // add or remove: [action, changedValue, location]
   // change ["change", [new, old], location]
   var changes = {
      quarters: [], // add or remove [action, changedValue] Ex. ["remove", "Summer 2020"]
      subjects: [], //add or remove [action, changedValue, [quarter]] Ex. ["add", "MATH", ["Fall 2020"]]
      courses: [], //add or remove [action, changedValue, [quarter, subject]] Ex. ["remove", "MATH 151", ["Fall 2020", "MATH"]]
      sections: [], //add or remove [action, changedValue, [quarter, subject, course] ] Ex. ["remove", "4001", ["Fall 2020", "ACCT", "ACCT 101"]]
      instructor: [], //change ["change", [new, old], [quarter, subject, course, section] ] Ex. ["remove", "4001", ["Fall 2020", "ACCT", "ACCT 101", "4001"]]
      seats: [], //change ["change", [new, old], [quarter, subject, course, section] ] Ex. ["remove", "4001", ["Fall 2020", "ACCT", "ACCT 101", "4001"]]
	};
	
	
	
	
   //bcAPI.methods.getClasses(() => {
		var newData = bcAPI.data;
		var oldData = bcAPI.oldData;
		
		
      // compare quarters
		
		// compare subjects
		
		console.log(compareSubjects(newData, oldData, ["Winter2020"]));
		
      // compare courses
		console.log(compareCourses(newData, oldData, ["Spring2020", "ACCT&"]));

      // compare sections

      // compare instructor

      // compare seats

      function compareQuarters(newData, oldData) {
         var results = [];
      }
      function compareSubjects(newData, oldData, location) {
			var results = [];
         var newObject = newData.classes.quarters[location[0]];
         var oldObject = oldData.classes.quarters[location[0]];

         //compare
         var newList = Object.keys(newObject);
         var oldList = Object.keys(oldObject);
			var added = newList.filter((x) => oldList.indexOf(x) === -1);
			var removed = oldList.filter((x) => newList.indexOf(x) === -1);

			//format results
			var location = [newData.quarters[location[0]].FriendlyName];
         for (item of added) {
            results.push([
               actionAdded,
               item,
               location,
            ]);
         }
			for (item of removed) {
            results.push([
               actionRemoved,
               item,
               location,
            ]);
			}
			return results;
      }
      function compareCourses(newData, oldData, location) {
         var results = [];
         var newObject = newData.classes.quarters[location[0]][location[1]].Courses;
         var oldObject = oldData.classes.quarters[location[0]][location[1]].Courses;

         //compare
         var newList = Object.keys(newObject);
			var oldList = Object.keys(oldObject);
			console.log(oldList);
			var added = newList.filter((x) => oldList.indexOf(x) === -1);
			var removed = oldList.filter((x) => newList.indexOf(x) === -1);

			//format results
			var location = [newData.quarters[location[0]].FriendlyName, location[1]];
         for (item of added) {
            results.push([
               actionAdded,
               item,
               location,
            ]);
         }
			for (item of removed) {
            results.push([
               actionRemoved,
               item,
               location,
            ]);
			}
			return results;
      }
      function compareSections(newData, oldData, location) {
         var results = [];
      }
      function compareInstructor(nnewData, oldData, location) {
         var results = [];
      }
      function compareSeats(newData, oldData, location) {}
      var results = [];
   //});
}

function notifyChanges() {}
