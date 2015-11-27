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
}, "errorEvent", "endEvent");

console.log(JSON.stringify(e.toObject(), null, 4));
// =>
// {
//     "A": {
//         "flow": {
//             "someEvent": {
//                 "data": [
//                     [
//                         ">>eventToEmit",
//                         {
//                             "to": "B"
//                         }
//                     ]
//                 ],
//                 "error": "errorEvent",
//                 "end": "endEvent"
//             }
//         },
//         "name": "A"
//     },
//     "B": {
//         "flow": {},
//         "name": "B"
//     }
// }
