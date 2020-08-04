var fs = require("fs");
var data = JSON.parse(fs.readFileSync("./classCache.json"));
console.log("\n\nLOADED CACHED DATA\n\n");

module.exports = data;
