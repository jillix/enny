// Dependencies
var Enny = require("../lib");

// Initialize Enny in memory
var e = new Enny();

// Add two instances
var aIns = e.addInstance({ name: "A" })
  , bIns = e.addInstance({ name: "B" })
  ;

aIns.on("someEvent", {
    emit: "eventToEmit",
    to: "B"
});

console.log(JSON.stringify(e.toObject(), null, 4));
