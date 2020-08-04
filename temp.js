var fs = require("fs");
var data = JSON.parse(fs.readFileSync("./classCache.json"));
var data2 = JSON.parse(fs.readFileSync("./classCache2.json"));
console.log("\n\nLOADED CACHED DATA\n\n");

module.exports.data1 = data;
module.exports.data2 = data2;
