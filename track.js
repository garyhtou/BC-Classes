var cron = require("node-cron");
var fbAdmin = require("./utils/fbAdmin");
var bcAPI = require("./utils/bcAPI");
var email = require("./utils/email");

// SCHEDULE
var scheduleMethods = [
	[bcAPI.update.updateQuarters, "0 0 */12 * * *"],
	[findChanges, "0 0 * * * *"],
	[bcAPI.update.updateAllSeats, "0 30 4 * * *"],
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
				", {timezone: 'America/Los_Angeles'}).start();";
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
const actionChanged = "changed";

var changes = {
	quarters: [],
	subjects: [],
	courses: [],
	sections: [],
	instructor: [],
	seats: [],
};

var changeHistory = {};

function findChanges(callback) {
	callback = callback || function () {};
	// FORMAT:
	// Everything should be friendly values
	// add or remove: [action, changedValue, location]
	// change ["change", [new, old], location]

	var changesTemplate = {
		quarters: [], // add or remove [action, changedValue, []] Ex. ["remove", "Summer 2020", []]
		subjects: [], //add or remove [action, changedValue, [quarter]] Ex. ["add", "MATH", ["Fall 2020"]]
		courses: [], //add or remove [action, changedValue, [quarter, subject]] Ex. ["remove", "MATH 151", ["Fall 2020", "MATH"]]
		sections: [], //add or remove [action, changedValue, [quarter, subject, course] ] Ex. ["remove", "4001", ["Fall 2020", "ACCT", "ACCT 101"]]
		instructor: [], //change ["change", [new, old], [quarter, subject, course, section] ] Ex. ["remove", "4001", ["Fall 2020", "ACCT", "ACCT 101", "4001"]]
		seats: [], //change ["change", [new, old], [quarter, subject, course, section] ] Ex. ["remove", "4001", ["Fall 2020", "ACCT", "ACCT 101", "4001"]]
	};

	var newChanges = JSON.parse(JSON.stringify(changesTemplate));

	bcAPI.update.updateClasses(() => {
		console.log("\n\nFinding Changes");
		var newData = bcAPI.getData();
		var oldData = bcAPI.getOldData();

		// compare quarters
		newChanges.quarters = compareQuarters(newData, oldData, []);

		for (quarter in newData.quarters) {
			// compare subjects
			newChanges.subjects.push(...compareSubjects(newData, oldData, [quarter]));

			for (subject in newData.classes.quarters[quarter]) {
				// compare courses
				newChanges.courses.push(
					...compareCourses(newData, oldData, [quarter, subject])
				);

				for (course in newData.classes.quarters[quarter][subject].Courses) {
					// compare sections
					newChanges.sections.push(
						...compareSections(newData, oldData, [quarter, subject, course])
					);

					for (section in newData.classes.quarters[quarter][subject].Courses[
						course
					].Sections) {
						// compare instructor
						newChanges.instructor.push(
							...compareInstructor(newData, oldData, [
								quarter,
								subject,
								course,
								section,
							])
						);

						// compare seats
						newChanges.seats.push(
							...compareSeats(newData, oldData, [
								quarter,
								subject,
								course,
								section,
							])
						);
					}
				}
			}
		}

		changes = newChanges;

		fbAdmin.addChanges(changes);
		fbAdmin.storeData();

		console.log("DONE finding changes");

		if (JSON.stringify(newChanges) != JSON.stringify(changesTemplate)) {
			console.log("queued email changes");
			email.queueEmailChanges(changes);
		} else {
			console.log("no changes found");
		}

		callback(null, changes);
	});

	// HELPER METHODS ---------------------------

	function compareQuarters(newData, oldData, location) {
		var results = [];

		try {
			var newObject = newData.classes.quarters;
			var oldObject = oldData.classes.quarters;

			if (newObject == undefined || oldObject == undefined) {
				// incase parent or current  is removed
				console.log("Undefined Object: " + location);
				throw new Error("Object is undefined. Parent was removed");
			}
		} catch (e) {
			//this should never happen
			return results;
		}

		//compare
		var newList = Object.keys(newObject);
		var oldList = Object.keys(oldObject);
		var added = newList.filter((x) => oldList.indexOf(x) === -1);
		var removed = oldList.filter((x) => newList.indexOf(x) === -1);

		//format results
		var location = [];
		for (item of added) {
			results.push([actionAdded, item, location]);
		}
		for (item of removed) {
			results.push([actionRemoved, item, location]);
		}
		return results;
	}
	function compareSubjects(newData, oldData, location) {
		var results = [];

		try {
			var newObject = newData.classes.quarters[location[0]];
			var oldObject = oldData.classes.quarters[location[0]];

			if (newObject == undefined || oldObject == undefined) {
				// incase parent or current  is removed
				console.log("Undefined Object: " + location);
				throw new Error("Object is undefined. Parent was removed");
			}
		} catch (e) {
			return results;
		}

		//compare
		var newList = Object.keys(newObject);
		var oldList = Object.keys(oldObject);
		var added = newList.filter((x) => oldList.indexOf(x) === -1);
		var removed = oldList.filter((x) => newList.indexOf(x) === -1);

		//format results
		var location = [newData.quarters[location[0]].FriendlyName];
		for (item of added) {
			results.push([actionAdded, item, location]);
		}
		for (item of removed) {
			results.push([actionRemoved, item, location]);
		}
		return results;
	}
	function compareCourses(newData, oldData, location) {
		var results = [];

		try {
			var newObject =
				newData.classes.quarters[location[0]][location[1]].Courses;
			var oldObject =
				oldData.classes.quarters[location[0]][location[1]].Courses;

			if (newObject == undefined || oldObject == undefined) {
				// incase parent or current  is removed
				console.log("Undefined Object: " + location);
				throw new Error("Object is undefined. Parent was removed");
			}
		} catch (e) {
			return results;
		}

		//compare
		var newList = Object.keys(newObject);
		var oldList = Object.keys(oldObject);
		var added = newList.filter((x) => oldList.indexOf(x) === -1);
		var removed = oldList.filter((x) => newList.indexOf(x) === -1);

		//format results
		var location = [newData.quarters[location[0]].FriendlyName, location[1]];
		for (item of added) {
			results.push([actionAdded, item, location]);
		}
		for (item of removed) {
			results.push([actionRemoved, item, location]);
		}
		return results;
	}
	function compareSections(newData, oldData, location) {
		var results = [];

		try {
			var newObject =
				newData.classes.quarters[location[0]][location[1]].Courses[location[2]]
					.Sections;
			var oldObject =
				oldData.classes.quarters[location[0]][location[1]].Courses[location[2]]
					.Sections;

			if (newObject == undefined || oldObject == undefined) {
				// incase parent or current  is removed
				console.log("Undefined Object: " + location);
				throw new Error("Object is undefined. Parent was removed");
			}
		} catch (e) {
			return results;
		}

		//compare
		var newList = Object.keys(newObject);
		var oldList = Object.keys(oldObject);
		var added = newList.filter((x) => oldList.indexOf(x) === -1);
		var removed = oldList.filter((x) => newList.indexOf(x) === -1);

		//format results
		var location = [
			newData.quarters[location[0]].FriendlyName,
			location[1],
			location[2],
		];
		for (item of added) {
			results.push([actionAdded, item, location]);
		}
		for (item of removed) {
			results.push([actionRemoved, item, location]);
		}
		return results;
	}
	function compareInstructor(newData, oldData, location) {
		var results = [];

		try {
			var newObject =
				newData.classes.quarters[location[0]][location[1]].Courses[location[2]]
					.Sections[location[3]];
			var oldObject =
				oldData.classes.quarters[location[0]][location[1]].Courses[location[2]]
					.Sections[location[3]];

			if (newObject == undefined || oldObject == undefined) {
				// incase parent or current is removed
				console.log("Undefined Object: " + location);
				throw new Error("Object is undefined. Parent was removed");
			}
		} catch (e) {
			return results;
		}

		//compare
		var newInstructor = newObject.Offered[0].InstructorName;
		var oldInstructor = oldObject.Offered[0].InstructorName;

		if (newInstructor != oldInstructor) {
			var location = [
				newData.quarters[location[0]].FriendlyName,
				location[1],
				location[2],
				location[3],
			];
			results.push([actionChanged, [newInstructor, oldInstructor], location]);
		}

		return results;
	}
	function compareSeats(newData, oldData, location) {
		var results = [];

		try {
			var newObject =
				newData.classes.quarters[location[0]][location[1]].Courses[location[2]]
					.Sections[location[3]];
			var oldObject =
				oldData.classes.quarters[location[0]][location[1]].Courses[location[2]]
					.Sections[location[3]];

			if (newObject == undefined || oldObject == undefined) {
				// incase parent or current is removed
				console.log("Undefined Object: " + location);
				throw new Error("Object is undefined. Parent was removed");
			}
		} catch (e) {
			return results;
		}

		//compare
		var newAvailSeats = newObject.SeatsAvailable;
		var oldAvailSeats = oldObject.SeatsAvailable;

		if (newAvailSeats != oldAvailSeats) {
			var location = [
				newData.quarters[location[0]].FriendlyName,
				location[1],
				location[2],
				location[3],
			];
			results.push([
				actionChanged,
				[newAvailSeats.toString(), oldAvailSeats.toString()],
				location,
			]);
		}

		return results;
	}
}

//get change history
function updateChangeHistory() {
	fbAdmin.admin
		.database()
		.ref("changes")
		.on("value", (snapshot) => {
			changeHistory = snapshot.val();
		});
}
updateChangeHistory();

module.exports.getChanges = function () {
	return changes;
};
module.exports.getChangeHistory = function () {
	return changeHistory;
};
