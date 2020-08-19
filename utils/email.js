var nodemailer = require("nodemailer");
var fbAdmin = require("./fbAdmin");

var ejs = require("ejs");
var template_changeNotification = require("fs").readFileSync(
	"./utils/emailTemplates/changeNotification.ejs",
	"utf-8"
);

require("dotenv").config();

let transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

async function queueEmailChanges(changes) {
	compileEmails(changes, (err, emails) => {
		console.log("EMAILS: " + JSON.stringify(emails));

		var emailLoopCounter = 0;
		var emailLoop = function (emails) {
			if (emailLoopCounter >= emails.length) return;

			var email = emails[emailLoopCounter];
			var to = email[0];
			var name = email[1];
			var type = email[2];
			var change = email[3];

			console.log("in email loop for " + to);

			var locationLast = change[2][change[2].length - 1];
			if (locationLast == undefined) {
				locationLast = "avalaible quarters";
			}

			var location = "";
			// remove subject with course is in path
			if (type == "quarter") {
				location = locationLast;
			} else if (type == "subject") {
				location = change[2].join(", ");
			} else if (type == "section" || type == "instructor" || type == "seats") {
				var locListNoSubject = [...change[2]];
				locListNoSubject[3] = "section " + locListNoSubject[3];
				locationLast = locListNoSubject[3];
				locListNoSubject.splice(1, 1);
				location = locListNoSubject.join(", ");
			} else {
				var locListNoSubject = [...change[2]];
				locListNoSubject.splice(1, 1);
				location = locListNoSubject.join(", ");
			}

			var subject = "[BC Classes] ";
			var htmlMessage = "";
			var textMessage = "";
			if (change[0] == "changed") {
				var typeCap = type.split("");
				typeCap[0] = typeCap[0].toUpperCase();
				typeCap = typeCap.join("");

				var changeNew;
				var changeOld;

				if (type === "instructor") {
					if (change[1][0] === "") {
						changeNew = "Staff";
					} else {
						changeNew = change[1][0];
					}
					if (change[1][1] === "") {
						changeOld = "Staff";
					} else {
						changeOld = change[1][1];
					}
				}

				htmlMessage =
					typeCap +
					" has changed from <b>" +
					changeOld +
					"</b> to <b>" +
					changeNew +
					"</b> for " +
					location +
					".";

				textMessage =
					typeCap +
					" has changed from " +
					changeOld +
					" to " +
					changeNew +
					" for " +
					location +
					".";

				subject +=
					typeCap + " has changed from " + changeOld + " to " + changeNew;
			} else if (change[0] == "added") {
				htmlMessage =
					"<b>" + change[1] + "</b> has been <b>added</b> to " + location + ".";
				textMessage = change[1] + " has been added to " + location + ".";

				subject += change[1] + " has been added";
			} else if (change[0] == "removed") {
				htmlMessage =
					"<b>" +
					change[1] +
					"</b> has been <b>removed</b> from " +
					location +
					".";
				textMessage = change[1] + " has been removed from " + location + ".";

				subject += change[1] + " has been removed";
			}

			var html = ejs.render(template_changeNotification, {
				data: { name: name, locationLast: locationLast, message: htmlMessage },
			});

			var text =
				"Hello " + name + ", \n" + textMessage + "\nBest,\nGary's Pet Robot 🤖";

			sendEmail(to, subject, html, text, (err, info) => {
				console.log(info);

				emailLoopCounter++;
				if (emailLoopCounter < emails.length) {
					emailLoop(emails);
				} else {
					// Store data AFTER changes are sent. This will ensure that emails are sent even if
					// server goes down while sending emails. If that does happen, some will recieve emails twice
					fbAdmin.storeData();

					return console.log("DONE SENDING EMAILS!");
				}
			});
		};
		emailLoop(emails);
	});
}

function compileEmails(changes, callback) {
	callback = callback || function () {};
	console.log("\nCOMPILING EMAILS");

	//wait until reg is 100% updated
	fbAdmin.updateRegistrations(async (err, registrations) => {
		//format [ email, name, changeType, [changes] ]
		var emails = []; //[ ["hello@domain.com", "Bill Joe", "course", <insert from param>] ]

		for (user in registrations) {
			for (registration in registrations[user]) {
				var registrationObj = registrations[user][registration];

				// find registration type
				var registrationType = [];
				if (
					registrationObj.quarter != "" &&
					registrationObj.subject == "" &&
					registrationObj.course == ""
				) {
					registrationType.push("quarter");
				}
				if (
					registrationObj.quarter != "" &&
					registrationObj.subject != "" &&
					registrationObj.course == ""
				) {
					registrationType.push("subject");
				}
				if (
					registrationObj.quarter != "" &&
					registrationObj.subject != "" &&
					registrationObj.course != "" &&
					registrationObj.section == ""
				) {
					registrationType.push("course");
				}
				if (
					registrationObj.quarter != "" &&
					registrationObj.subject != "" &&
					registrationObj.course != "" &&
					registrationObj.section != ""
				) {
					registrationType.push("section");
				}
				if (
					registrationObj.quarter != "" &&
					registrationObj.subject != "" &&
					registrationObj.course != "" &&
					registrationObj.section != "" &&
					registrationObj.instructor == true
				) {
					registrationType.push("instructor");
				}
				if (
					registrationObj.quarter != "" &&
					registrationObj.subject != "" &&
					registrationObj.course != "" &&
					registrationObj.section != "" &&
					registrationObj.seats != -1
				) {
					registrationType.push("seats");
				}

				console.log(registrationObj);

				// find match
				if (registrationType.includes("quarter")) {
					for (subject in changes.subjects) {
						var change = changes.subjects[subject];

						//if changed matches registration
						if (registrationObj.quarter == change[2][0].replace(/ /g, "")) {
							var userInfo = await fbAdmin.getUserInfo(user);
							var userEmail = userInfo.email;
							var userName = userInfo.name;
							emails.push([userEmail, userName, "quarter", change]);
							console.log(change);
						}
					}
				}
				if (registrationType.includes("subject")) {
					for (course in changes.courses) {
						var change = changes.courses[course];
						//if changed matches registration
						if (
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][0]
						) {
							var userInfo = await fbAdmin.getUserInfo(user);
							var userEmail = userInfo.email;
							var userName = userInfo.name;
							emails.push([userEmail, userName, "subject", change]);
							console.log(change);
						}
					}
				}
				if (registrationType.includes("course")) {
					for (section in changes.sections) {
						var change = changes.sections[section];

						//if changed matches registration
						if (
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1] &&
							registrationObj.course == change[2][3]
						) {
							var userInfo = await fbAdmin.getUserInfo(user);
							var userEmail = userInfo.email;
							var userName = userInfo.name;
							emails.push([userEmail, userName, "course", change]);
							console.log(change);
						}
					}
				}
				if (registrationType.includes("section")) {
					// no action here... registrations must have selected updates about instructor and/or seats in the section
				}
				if (registrationType.includes("instructor")) {
					for (instructor in changes.instructor) {
						var change = changes.instructor[instructor];
						//if changed matches registration
						if (
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1] &&
							registrationObj.course == change[2][2] &&
							registrationObj.section == change[2][3]
						) {
							var userInfo = await fbAdmin.getUserInfo(user);
							var userEmail = userInfo.email;
							var userName = userInfo.name;
							emails.push([userEmail, userName, "instructor", change]);
							console.log(change);
						}
					}
				}
				if (registrationType.includes("seats")) {
					for (seat in changes.seats) {
						var change = changes.seats[seat];

						//if changed matches registration
						if (
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1] &&
							registrationObj.course == change[2][2] &&
							registrationObj.section == change[2][3]
						) {
							//if number of seats went down and is <= registration request
							if (
								parseInt(change[1][0]) < parseInt(change[1][1]) &&
								parseInt(registrationObj.seats) >= parseInt(change[1][0]) &&
								parseInt(registrationObj.seats) <= parseInt(change[1][1])
							) {
								var userInfo = await fbAdmin.getUserInfo(user);
								var userEmail = userInfo.email;
								var userName = userInfo.name;
								emails.push([userEmail, userName, "seats", change]);
								console.log(change);
							}
						}
					}
				}
			}
		}

		return callback(null, emails);
	});
}

function sendEmail(to, subject, html, text, callback) {
	callback = callback || function () {};

	transporter.sendMail(
		{
			from: process.env.EMAIL_FROM, // sender address
			to: to, // list of receivers
			cc: process.env.EMAIL_FROM,
			subject: subject, // Subject line
			text: text, // plain text body
			html: html, // html body
		},
		(err, info) => {
			if (err) {
				console.log(err);
				return callback(err);
			}
			console.log("Email sent to: " + to);
			callback(null, info);
		}
	);
}

module.exports.queueEmailChanges = queueEmailChanges;
