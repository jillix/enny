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
aIns.addFlow([{
    event: "foo", once: true
}, {
    handler: "foo", args: [1, 2, 3], isStream: false, type: "dataHandler"
}])

console.log(JSON.stringify(e, null, 4));
// =>
// {
//     "A": {
//         "name": "A",
//         "client": {
//             "load": [
//                 "B"
//             ],
//             "flow": [
//                 [
//                     [
//                         "foo"
//                     ],
//                     [
//                         ":foo",
//                         1,
//                         2,
//                         3
//                     ]
//                 ]
//             ]
//         }
//     },
//     "B": {
//         "name": "B"
//     }
// }

console.log(new Enny.FlowComponent({ error: "foo", args: ["bar", "baz"]}).toFlow());
// => ["!foo", "bar", "baz"]

console.log(new Enny.FlowComponent({ emit: "some-event" }).toFlow());
console.log(new Enny.FlowComponent({ emit: "some-event", to: "some-instance" }).toFlow());
console.log(new Enny.FlowComponent({ link: "server-event", to: "some-instance" }).toFlow());
// => ["!foo", "bar", "baz"]
