var request = require("request");
var fbAdmin = require("./fbAdmin");

var data = {
	quarters: {},
	classes: { quarters: {} },
};
var oldData = {
	quarters: {},
	classes: {},
};

// get existing data from firebase. Only runs on start up
// this allows front end /data to work instantly
async function setDataOnStart() {
	var fbData = await fbAdmin.getStoredData();
	if (fbData !== null) {
		data = fbData;
	} else {
		console.log('FIREBASE "/DATA/" IS NULL. in getDataOnStart()');
	}
}

// TESTING ONLY!!!!!!
// data.classes = require("../temp").data1;
// oldData.classes = require("../temp").data2;

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

		// BEGIN: ONLY ADD TWO NEWEST QUARTER (speeds things up)

		// Original code
		// body.NavigationQuarters.map((quarter) => {
		// 	var slug = new String(quarter.FriendlyName).replace(/ /g, "");
		// 	data.quarters[slug] = quarter;
		// 	if (!data.classes.quarters.hasOwnProperty(slug)) {
		// 		data.classes.quarters[slug] = {};
		// 	}
		// });

		let numNewestQuarters = 2; // Keep track of the last x newest quarters
		let newestQuarters = [];
		for (
			let quarterIndex = 0;
			quarterIndex < numNewestQuarters;
			quarterIndex++
		) {
			newestQuarters.push(body.NavigationQuarters[quarterIndex]);
		}
		newestQuarters.map((quarter) => {
			if (typeof body.NavigationQuarters[0] !== "undefined") {
				var slug = new String(quarter.FriendlyName).replace(/ /g, "");
				data.quarters[slug] = quarter;
				if (!data.classes.quarters.hasOwnProperty(slug)) {
					data.classes.quarters[slug] = {};
				}
			}
		});

		// END ONLY ADD TWO NEWEST QUARTER

		// BEGIN MANUAL ADD QUARTER
		// if (typeof data.quarters.Spring2021 === "undefined") {
		// 	data.quarters.Spring2021 = {
		// 		ID: "C014",
		// 		FriendlyName: "Spring 2021",
		// 	};
		// 	if (!data.classes.quarters.hasOwnProperty("Spring2021")) {
		// 		data.classes.quarters["Spring2021"] = {};
		// 	}
		// }
		// END MANUAL ADD QUARTER

		// STORE QUARTERS IN DATABASE
		fbAdmin.admin
			.database()
			.ref("/data/quarters")
			.set(data.quarters)
			.then(() => {
				console.log("\nGOT QUARTERS");
				console.log(data.quarters);
				console.log(data.classes.quarters);
				callback(null, data.quarters);
			});
	});
}

function getClasses(callback) {
	callback = callback || function () {};

	console.log("\nGETTING CLASSES");

	fbAdmin.getStoredData().then((snapshot) => {
		if (snapshot !== null) {
			oldData.classes = snapshot.classes;
		} else {
			console.log('FIREBASE "/DATA/" IS NULL. in getClasses()');
			oldData.classes = JSON.parse(JSON.stringify(data.classes));
		}

		var quarters = {};

		// get quarter slugs
		Object.keys(data.quarters).map((quarter) => {
			quarters[quarter] = {};
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

						loopSubjectCounter++;
						if (loopSubjectCounter < subjectSlugs.length) {
							loopSubjects(quarterSlug, subjectSlugs);
						} else {
							loopQuarterCounter++;
							if (loopQuarterCounter < quarterSlugs.length) {
								loopQuarters(quarterSlugs);
							} else {
								//console.log(JSON.stringify(data.classes));

								// Make sure everything's save before call back and replace removed quarters
								data.classes.quarters = quarters;
								console.log("\n  GOT ALL CLASSES");
								console.log(
									"Current time: " + new Date().toLocaleString() + "\n"
								);
								callback(null, data.classes);
							}
						}
					});
				};
				loopSubjects(quarterSlug, subjectSlugs);
			});
		};
		loopQuarters(Object.keys(quarters));
	});
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
			// if course doesn't already exist
			if (courses[rawCourse.Sections[0].CourseID] == undefined) {
				var course = {};

				course.CourseID = rawCourse.Sections[0].CourseID;
				course.CourseTitle = rawCourse.Sections[0].CourseTitle;

				course.Sections = {};
				for (section of rawCourse.Sections) {
					course.Sections[section.ID.ItemNumber] = section;
				}

				// add to list of courses
				courses[course.CourseID] = course;
			} else {
				//if course already exists, add sections to existing course
				var existingSections = courses[rawCourse.Sections[0].CourseID].Sections;

				for (newSection in rawCourse.Sections) {
					var ItemNumber = rawCourse.Sections[newSection].ID.ItemNumber;
					existingSections[ItemNumber] = rawCourse.Sections[newSection];
				}
			}
		}

		console.log("  got " + quarterSlug + " " + subjectSlug);
		callback(null, courses);
	});
}

function getSeats(ItemNumber, quarterID, callback) {
	callback = callback || function () {};

	var url = "https://www2.bellevuecollege.edu/classes/Api/GetSeats";
	var classID = { classID: ItemNumber + quarterID };
	request.post({ url: url, json: classID }, function (err, response, body) {
		if (err) {
			console.log(err);
			return callback(err);
		}
		var seats = parseInt(body.split("|")[0]);
		console.log("Seats for " + ItemNumber + " of " + quarterID + ": " + seats);
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
					try {
						queue.push([
							indivSectionObject.ID.ItemNumber,
							indivSectionObject.ID.YearQuarter,
						]);
					} catch (e) {}

					// asynchronous
					// updateSeats(section.ID.ItemNumber, section.ID.YearQuarter);
				}
			}
		}
	}

	var loopSeatsCounter = 0;
	var loopSeats = function (classes) {
		getSeats(
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
module.exports.getData = () => {
	return data;
};
module.exports.getOldData = () => {
	return oldData;
};

// update then get data
var publicMethods = {
	updateQuarters: getQuarters,
	updateClasses: getClasses,
	updateSeats: getSeats,
	updateAllSeats: getAllSeats,
	setDataOnStart: setDataOnStart,
};

module.exports.update = publicMethods;
