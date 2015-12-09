# enny

Generate Engine compositions from human-readable inputs.

## Installation

```sh
$ npm i --save enny
```

## Example

```js
// Dependencies
var Enny = require("enny");

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
```

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

 - [`engine-parser`](https://github.com/IonicaBizau/engine-parser) by jillix

## License

[MIT][license] © [jillix][website]

[license]: http://showalicense.com/?fullname=jillix%20%3Ccontact%40jillix.com%3E%20(http%3A%2F%2Fjillix.com)&year=2015#license-mit
[website]: http://jillix.com
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md