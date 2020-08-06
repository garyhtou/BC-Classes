var nodemailer = require("nodemailer");
var fbAdmin = require("./utils/fbAdmin");
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

		return; //TODO ACTUALLY SEND EMAIL
		sendEmail();
	});
}

function compileEmails(changes, callback) {
	callback = callback || function () {};
	console.log("\nCOMPILING EMAILS");

	//wait until reg is 100% updated
	fbAdmin.updateRegistrations(async (err, registrations) => {
		//format [ email, changeType, [changes] ]
		var emails = []; //[ ["hello@domain.com", "course", <insert from param>] ]

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
					registrationObj.seats == true
				) {
					registrationType.push("seats");
				}

				console.log(registrationObj);

				// find match
				if (registrationType.includes("quarter")) {
					for (quarter in changes.quarters) {
						var change = changes.quarters[quarter];
						console.log(change);

						//if changed matches registration
						if (registrationObj.quarter == change[1].replace(/ /g, "")) {
							var userEmail = await fbAdmin.getUserEmail(user);
							emails.push([userEmail, "quarter", change]);
						}
					}
				}
				if (registrationType.includes("subject")) {
					for (subject in changes.subjects) {
						var change = changes.subjects[subject];
						console.log(change);
						//if changed matches registration
						if (
							registrationObj.subject == change[1] &&
							registrationObj.quarter == change[2][0].replace(/ /g, "")
						) {
							var userEmail = await fbAdmin.getUserEmail(user);
							emails.push([userEmail, "subject", change]);
						}
					}
				}
				if (registrationType.includes("course")) {
					for (course in changes.courses) {
						var change = changes.courses[course];
						console.log(change);

						//if changed matches registration
						if (
							registrationObj.course == change[1] &&
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1]
						) {
							var userEmail = await fbAdmin.getUserEmail(user);
							emails.push([userEmail, "course", change]);
						}
					}
				}
				if (registrationType.includes("section")) {
					for (section in changes.sections) {
						var change = changes.sections[section];
						console.log(change);

						//if changed matches registration
						if (
							registrationObj.section == change[1] &&
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1] &&
							registrationObj.course == change[2][2]
						) {
							var userEmail = await fbAdmin.getUserEmail(user);
							emails.push([userEmail, "section", change]);
						}
					}
				}
				if (registrationType.includes("instructor")) {
					for (instructor in changes.instructor) {
						var change = changes.instructor[instructor];
						console.log(change);

						//if changed matches registration
						if (
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1] &&
							registrationObj.course == change[2][2] &&
							registrationObj.section == change[2][3]
						) {
							var userEmail = await fbAdmin.getUserEmail(user);
							emails.push([userEmail, "instructor", change]);
						}
					}
				}
				if (registrationType.includes("seats")) {
					for (seat in changes.seats) {
						var change = changes.seats[seat];
						console.log(change);

						//if changed matches registration
						if (
							registrationObj.quarter == change[2][0].replace(/ /g, "") &&
							registrationObj.subject == change[2][1] &&
							registrationObj.course == change[2][2] &&
							registrationObj.section == change[2][3]
						) {
							var userEmail = await fbAdmin.getUserEmail(user);
							console.log("EMAIL: " + userEmail);
							emails.push([userEmail, "seats", change]);
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
