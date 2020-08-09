var cron = require("node-cron");
var request = require("request");
var pingUrl = "";

function ping() {
	request({ url: pingUrl, method: "GET" }, (err, res, body) => {
		if (err) {
			return console.log(err);
		}
		console.log("    [self pinged]: " + new Date().toLocaleString());
	});
}

var start = false;
async function startPing(url) {
	if (!start) {
		pingUrl = url;
		start = true;
		// ping every 5 secs
		cron.schedule("*/5 * * * * *", ping);
		console.log("\nStarting self pings at: " + pingUrl + "\n");
	}
	return;
}

module.exports.ping = startPing;
