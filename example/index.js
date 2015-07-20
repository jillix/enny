// Dependencies
var Enny = require("../lib");

// Initialize Enny in memory
var e = new Enny();

// Add two instances
var aIns = e.addInstance({ name: "A" })
  , bIns = e.addInstance({ name: "B" })
  ;

// Connect A -> B
aIns.connect(bIns);

console.log(JSON.stringify(e, null, 4));
