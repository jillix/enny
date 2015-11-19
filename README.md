# enny

Generate Engine compositions from human-readable inputs.

## Installation

```sh
$ npm i enny
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
//                 [],
//                 []
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
// => [ 'flow', 'some-event' ]

console.log(new Enny.FlowComponent({ emit: "some-event", to: "some-instance" }).toFlow());
// => [ 'some-instance/flow', 'some-event' ]

console.log(new Enny.FlowComponent({ link: "server-event", to: "some-instance" }).toFlow());
// => [ 'flow', '@some-instance/server-event' ]

console.log(new Enny.FlowComponent({ stream: "someStream", to: "some-instance" }).toFlow());
// => some-instance/someStream

console.log(new Enny.FlowElement([
    { event: "listener-event" }
  , { error: "error-handler" }
  , { stream: "someStream", to: "some-instance" }
]).toFlow());
// =>
// [ 'listener-event',
//   '!error-handler',
//   'some-instance/someStream' ]
```

## Documentation

### `Enny()`
Create a new Enny instance

#### Return
- **Enny** The `Enny` instance.

### `toObject()`
Converts the internal composition into an object.

#### Return
- **Object** The modified composition.

### `renameInstance(oldName, newName, cb)`
Renames the specified instance. This will update the instance references in the entire app.

#### Params
- **String** `oldName`: The old instance name.
- **String** `newName`: The new instance name.
- **Function** `cb`: The callback function.

### `toJSON()`
This function is called internally when `JSON.stringify`-ing the things.

#### Return
- **Object** The object that should be stringified.

### `addInstance(ins)`
Adds a new instance.

#### Params
- **Object** `ins`: The Engine instance you want to add.

#### Return
- **Instance** The instance object.

### `Instance(data, options)`
Create a new `Instance` (Engine Instance) instance.

#### Params
- **Object** `data`: The raw Engine instance object.
- **Object** `options`: An object containing the following fields:
 - `enny` (Enny): The `Enny` instance.

#### Return
- **Instance** The `Instance` instance.

### `connect(ins, options, callback)`
Connect two instances.

#### Params
- **Instance** `ins`: The target instance.
- **Object|Boolean** `options`: If it's a Boolean value, then it will be interpreted as the `client` field. If it's an object, it should contain the following fields:
 - `client` (Boolean) If `true`, the connection will be on the client side, otherwise on the server (default: `true`).
 - `save` (Boolean) If `true`, the abstract `save` method will be called–this should have a custom implementation (default: `false`).
- **Function** `callback`: An optional callback function.

#### Return
- **Instance** The current instance.

### `addFlow(flow, options)`
Adds a set of FlowElements to the current instance.

#### Params
- **Array** `flow`: An array of human-readable objects, interpreted by `FlowElement`.
- **Object** `options`: The object passed to `FlowElement`.

### `addFlowElement(flElm, options, callback)`
Adds flow configuration.

#### Params
- **Array** `flElm`: The flow element.
- **Object** `options`: An object containing the following fields:
 - `client` (Boolean) If `true`, the connection will be on the client side, otherwise on the server (default: `true`).
 - `save` (Boolean) If `true`, the abstract `save` method will be called–this should have a custom implementation (default: `false`).
- **Function** `callback`: The callback function.

#### Return
- **Instance** The current instance.

### `toObject()`
Converts the internal composition into object format.

#### Return
- **Object** The prepared composition as object.

### `FlowElement(data)`
Creates a new instance of `FlowElement`.

#### Params
- **Array** `data`: The flow element.

#### Return
- **FlowElement** The `FlowElement` instance.

### `toJSON()`
This is called internally when `JSON.stringify`-ing the things.

#### Return
- **Array** The array that is stringified.

### `addComponent(data)`
Adds a new component.

#### Params
- **FlowComponent|Object** `data`: The flow component object or just an object that is wrapped by FlowComponent.

### `toFlow()`
Converts the internal data into a Engine syntax flow array.

#### Return
- **Array** The flow array.

### `Handler(data)`
Creates a new `Handler` instance.

#### Params
- **Object** `data`: An object containing the following fields:
 - `to` (String): The target instance name.
 - `args` (Array): Additional arguments in the handler call.
 - `isStream` (Boolean): If `true`, the handler will be a stream handler.
 - `handler` (String): The method name.
 - `isLink` (Boolean): If `true`, the handler will be a server side method (called from the client)–aka *link*.

#### Return
- **Handler** The `Handler` instance:

### `toFlow()`
Converts the internal data into a Engine syntax flow array.

#### Return
- **Array** The Engine syntax array result.

### `FlowComponent(data)`
Creates anew `FlowComponent` instance.

#### Params
- **Object** `data`: An object containing the following fields:
 - for event listeners:
     - `event` (String): The event name.
 - for stream handlers:
     - `stream` (String): The stream handler name.
 - for client to server calls:
     - `link` (String): The stream handler name.

#### Return
- **FlowComponent** The FlowComponent object.

### `toFlow()`
Converts the internal data into a Engine syntax flow array.

#### Return
- **Array** The flow array.

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

## License

See the [LICENSE](/LICENSE) file.

[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md