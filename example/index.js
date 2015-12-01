// Dependencies
var Enny = require("../lib");

// Initialize Enny in memory
var e = new Enny();

// Add two instances
var aIns = e.addInstance({ name: "A" })
  , bIns = e.addInstance({ name: "B" })
  ;

aIns.on("someEvent", {
    emit: "eventToEmit"
  , to: "B"
  , leaking: true
}, "errorEvent", "endEvent");

aIns.on("someEvent", [
    {
        dataHandler: "myDataHandler"
      , to: "myInstance"
      , once: true
      , data: {
            some: "data"
        }
    }
  , {
        streamHandler: "myStreamHandler"
      , leaking: true
    }
]);


console.log(JSON.stringify(e.toObject(), null, 4));
// =>
// {
//     "A": {
//         "flow": {
//             "someEvent": {
//                 "data": [
//                     [
//                         "|*eventToEmit",
//                         {
//                             "to": "B"
//                         }
//                     ],
//                     [
//                         ".myInstance/myDataHandler",
//                         {
//                             "some": "data"
//                         }
//                     ],
//                     "|*myStreamHandler"
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
