// Dependencies
var Ul = require("ul")
  , Typpy = require("typpy")
  , Deffy = require("deffy")
  , ObjectMap = require("map-o")
  , IterateObject = require("iterate-object")
  ;

// Constants
var TYPES = (function () {

    function types(a, b) {
        if (!a || !b) { return false; }
        if (typeof a === "string") {
            a = { type: a };
        }
        if (typeof b === "string") {
            b = { type: b };
        }
        return a.type === b.type;
    }

    // :some/datahandler
    types.dataHandler = {
        icon: "f087"
    };

    // !some/error-handler
    types.errorHandler = {
        icon: "f02d"
    };

    // instance/method
    types.streamHandler = {
        icon: "f0c4"
    };

    // ["load", ["foo"]]
    types.load = {
        handler: "LOAD"
    };

    // ["instance/flow", "some-event"]
    types.emit = {
        icon: "f077"
      , handler: "flow"
    };

    // ["link", "instance/method"]
    types.link = {
        icon: "f05c"
      , handler: "flow"
    };

    // "event"
    types.listener = {
        icon: "f030"
    };

    ObjectMap(types, function (name, value) {
        if (value.icon) {
            value.icon = "&#x" + value.icon;
        }
        value.type = name;
        value.name = name;
        return value;
    });

    return types;
})();

/**
 * Enny
 * Create a new Enny instance
 *
 * @name Enny
 * @function
 * @return {Enny} The `Enny` instance.
 */
function Enny() {
    var self = this;
    self.instances = {};
    self.Instance = function (data) {
        return new Enny.Instance(data, {
            enny: self
        });
    };
    self.FlowComponent = function (data) {
        return new Enny.FlowComponent(data, {
            enny: self
        });
    };
}

/**
 * toObject
 * Converts the internal composition into an object.
 *
 * @name toObject
 * @function
 * @return {Object} The modified composition.
 */
Enny.prototype.toObject = function () {
    return JSON.parse(JSON.stringify(this));
};

Enny.prototype.renameInstance = function (oldName, newName, cb) {

    cb = cb || function (err) {
        if (err) { throw err; }
        return arguments;
    }

    // Validate the old and new names
    if (typeof oldName !== "string") {
        return cb(new TypeError("The old instance name should be a string."));
    }

    if (typeof newName !== "string") {
        return cb(new TypeError("The new instance name should be a string."));
    }

    // Get the instance to rename
    var instanceToRename = this.instances[oldName];
    if (!instanceToRename) {
        return cb(new Error("There is no such instance."));
    }

    // Check for existence of instances with the new name
    if (this.instances[newName]) {
        return cb(new Error("There is already an instance with this new name: " + newName));
    }

    // Change the instance name
    instanceToRename._.name = newName;

    var changedInstances = {};
    var renameFlow = function (flow, cInstance) {
        if (!Array.isArray(flow)) { return; }
        IterateObject(flow, function (cElement) {
            IterateObject(cElement._, function (cComponent) {
                if (cComponent.data.instance === oldName) {
                    changedInstances[cInstance._.name] = true;
                    cComponent.data.to = newName;
                }
            });
        });
    };

    // Change the instance name in flows
    IterateObject(this.instances, function (cInstance) {
        if (cInstance._.name === oldName) { return; }
        renameFlow(cInstance._.flow, cInstance);
        renameFlow(Object(cInstance._.client).flow, cInstance);
    });

    // Change the cached instance
    this.instances[newName] = instanceToRename;
    delete this.instances[oldName];

    return cb(null, changedInstances);
};

/**
 * toJSON
 * This function is called internally when `JSON.stringify`-ing the things.
 *
 * @name toJSON
 * @function
 * @return {Object} The object that should be stringified.
 */
Enny.prototype.toJSON = function () {
    var self = this;
    var obj = {};
    Object.keys(self.instances).forEach(function (name) {
        obj[name] = self.instances[name]._;
    });
    return obj;
};

/**
 * addInstance
 * Adds a new instance.
 *
 * @name addInstance
 * @function
 * @param {Object} ins The Engine instance you want to add.
 * @return {Instance} The instance object.
 */
Enny.prototype.addInstance = function (ins) {
    ins = this.Instance(ins);
    this.instances[ins._.name] = ins;
    return ins;
};

/**
 * Instance
 * Create a new `Instance` (Engine Instance) instance.
 *
 * @name Instance
 * @function
 * @param {Object} data The raw Engine instance object.
 * @param {Object} options An object containing the following fields:
 *
 *  - `enny` (Enny): The `Enny` instance.
 *
 * @return {Instance} The `Instance` instance.
 */
Enny.Instance = function Instance (data, options) {
    if (Typpy(data) === "instance") {
        return data;
    }
    this._ = Ul.clone(data);
    if (this._.client) {
        delete this._.client.flow;
    }
    delete this._.flow;
    this.enny = options.enny;
};

/**
 * connect
 * Connect two instances.
 *
 * @name connect
 * @function
 * @param {Instance} ins The target instance.
 * @param {Object|Boolean} options If it's a Boolean value, then it will be interpreted as the `client` field. If it's an object, it should contain the following fields:
 *
 *  - `client` (Boolean) If `true`, the connection will be on the client side, otherwise on the server (default: `true`).
 *  - `save` (Boolean) If `true`, the abstract `save` method will be called–this should have a custom implementation (default: `false`).
 *
 * @param {Function} callback An optional callback function.
 * @return {Instance} The current instance.
 */
Enny.Instance.prototype.connect = function (ins, options, callback) {

    var self = this;
    if (typeof options === "boolean") {
        options = {
            client: options
        };
    } else if (options === "function") {
        callback = options;
        options = {};
    }

    callback = callback || function (err) {
        if (err) { console.error(err); }
    };
    options = Ul.merge(options, {
        client: true
      , save: false
    });
    ins = Enny.Instance(ins, options);

    if (!ins._.name) {
        return callback(new Error("The target instance name is required."));
    }

    if (!self._.name) {
        return callback(new Error("The source instance name is required."));
    }

    var load = null;
    if (options.client) {
        self._.client = Deffy(self._.client, {});
        load = self._.client.load = Deffy(self._.client.load, []);
    } else {
        load = self._.load = Deffy(self._.load, []);
    }
    load.push(ins._.name);
    if (options.save) {
        self.enny.save(callback);
        return self;
    }
    callback();
    return self;
};

Enny.Instance.prototype.addFlow = function (flow, options, callback) {
    var self = this;
    flow.forEach(function (c) {
        self.addFlowElement(c, options);
    });
};

/**
 * addFlowElement
 * Adds flow configuration.
 *
 * @name addFlowElement
 * @function
 * @param {Array} flElm The flow element.
 * @param {Object} options An object containing the following fields:
 *
 *  - `client` (Boolean) If `true`, the connection will be on the client side, otherwise on the server (default: `true`).
 *  - `save` (Boolean) If `true`, the abstract `save` method will be called–this should have a custom implementation (default: `false`).
 *
 * @param {Function} callback The callback function.
 * @return {Instance} The current instance.
 */
Enny.Instance.prototype.addFlowElement = function (flElm, options, callback) {

    var self = this;
    if (typeof options === "boolean") {
        options = {
            client: options
        };
    } else if (options === "function") {
        callback = options;
        options = {};
    }

    callback = callback || function (err) {
        if (err) { console.error(err); }
    };

    options = Ul.merge(options, {
        client: true
    });

    var flow = null;
    if (options.client) {
        self._.client = Deffy(self._.client, {});
        flow = self._.client.flow = Deffy(self._.client.flow, []);
    } else {
        flow = self._.flow = Deffy(self._.flow, []);
    }

    flElm = new Enny.FlowElement(flElm);
    flElm._.forEach(function (c) {
        if (c.data.to === self._.name) {
            c.data.to = null;
        }
    });

    flow.push(flElm);

    if (options.save) {
        self.enny.save(callback);
        return self;
    }

    callback();
};

/**
 * toObject
 * Converts the internal composition into object format.
 *
 * @name toObject
 * @function
 * @return {Object} The prepared composition as object.
 */
Enny.Instance.prototype.toObject = function () {
    return JSON.parse(JSON.stringify(this))._;
};

/**
 * FlowElement
 * Creates a new instance of `FlowElement`.
 *
 * @name FlowElement
 * @function
 * @param {Array} data The flow element.
 * @return {FlowElement} The `FlowElement` instance.
 */
Enny.FlowElement = function FlowElement (data) {
    var self = this;
    if (Typpy(data) === "flowelement") {
        return data;
    }
    this._ = [];
    if (Typpy(data) === "array") {
        data.forEach(self.addComponent.bind(self));
    }
};

/**
 * toJSON
 * This is called internally when `JSON.stringify`-ing the things.
 *
 * @name toJSON
 * @function
 * @return {Array} The array that is stringified.
 */
Enny.FlowElement.prototype.toJSON = function () {
    return this._.map(function (c) {
        return c.toFlow();
    });
};

/**
 * addComponent
 * Adds a new component.
 *
 * @name addComponent
 * @function
 * @param {FlowComponent|Object} data The flow component object or just an object that is wrapped by FlowComponent.
 */
Enny.FlowElement.prototype.addComponent = function (data) {
    data = new Enny.FlowComponent(data);
    this._.push(data);
};

/**
 * toFlow
 * Converts the internal data into a Engine syntax flow array.
 *
 * @name toFlow
 * @function
 * @return {Array} The flow array.
 */
Enny.FlowElement.prototype.toFlow = function () {
    return this._.map(function (c) {
        return c.toFlow();
    });
};

/**
 * Handler
 * Creates a new `Handler` instance.
 *
 * @name Handler
 * @function
 * @param {Object} data An object containing the following fields:
 *
 *  - `to` (String): The target instance name.
 *  - `args` (Array): Additional arguments in the handler call.
 *  - `isStream` (Boolean): If `true`, the handler will be a stream handler.
 *  - `handler` (String): The method name.
 *  - `isLink` (Boolean): If `true`, the handler will be a server side method (called from the client)–aka *link*.
 *
 * @return {Handler} The `Handler` instance:
 */
Enny.Handler = function Handler(data) {
    if (Typpy(data) === "handler") {
        return data;
    }
    this.to = data.to;
    this.args = Deffy(data.args, []);
    this.isStream = Deffy(data.isStream, true);
    this.isError = Deffy(data.isError, false);
    this.handler = data.handler;
    this.isLink = data.isLink;
    if (this.args.length && data.isLink) {
        this.args[0] = "@" + (this.to ? this.to + "/" : "") + this.args[0];
    }
};

/**
 * toFlow
 * Converts the internal data into a Engine syntax flow array.
 *
 * @name toFlow
 * @function
 * @return {Array} The Engine syntax array result.
 */
Enny.Handler.prototype.toFlow = function () {
    var res = [];
    res[0] = (this.isStream ? "" : this.isError ? "!" : ":") + (this.to && !this.isLink ? this.to + "/" : "") + this.handler;
    if (!this.args.length) {
        return res[0];
    }
    res = res.concat(this.args);
    return res;
};

/**
 * FlowComponent
 * Creates anew `FlowComponent` instance.
 *
 * @name FlowComponent
 * @function
 * @param {Object} data An object containing the following fields:
 *
 *  - for event listeners:
 *      - `event` (String): The event name.
 *  - for stream handlers:
 *      - `stream` (String): The stream handler name.
 *  - for client to server calls:
 *      - `link` (String): The stream handler name.
 *
 * @return {FlowComponent} The FlowComponent object.
 */
Enny.FlowComponent = function FlowComponent (data) {
    var self = this;

    if (Typpy(data) === "flowcomponent") {
        return data;
    }

    // Emit
    if (data.emit || TYPES(data.type, TYPES.emit)) {
        data.type = TYPES.emit;
        data.event = data.emit;
    }

    // Listen
    else if (data.event || TYPES(data.type, TYPES.listener)) {
        data.type = TYPES.listener;
    }

    // Stream handler
    else if (data.stream || TYPES(data.type, TYPES.streamHandler)) {
        data.type = TYPES.listener;
        data.type = TYPES.streamHandler;
        data.handler = data.stream || data.method;
    }

    // Data handler
    else if (data.data || TYPES(data.type, TYPES.dataHandler)) {
        data.type = TYPES.dataHandler;
        data.handler = data.data || data.method;
    }

    // Error handler
    else if (data.error || TYPES(data.type, TYPES.errorHandler)) {
        data.type = TYPES.errorHandler;
        data.handler = data.error || data.method;
    }

    // Link
    else if (data.link || TYPES(data.type, TYPES.link)) {
        data.type = TYPES.link;
    }

    // Load
    else if (data.load || TYPES(data.type, TYPES.emit)) {
        data.type = TYPES.load;
        data.target = data.load;
    }

    data.to = data.to || data.instance;
    self.data = Ul.clone(data);
};

/**
 * toFlow
 * Converts the internal data into a Engine syntax flow array.
 *
 * @name toFlow
 * @function
 * @return {Array} The flow array.
 */
Enny.FlowComponent.prototype.toFlow = function () {
    var data = this.data;
    var res = null;

    // Listener
    if (TYPES(data.type, TYPES.listener.type)) {
        if (data.once) {
            return [data.event];
        }
        return data.event;
    // Link
    } else if (TYPES(data.type, TYPES.link.type)) {
        return new Enny.Handler({
            args: [data.link]
          , handler: TYPES.link.handler
          , isLink: true
          , to: data.to
        }).toFlow();
    // Data/Error/Stream handler
    } else if (TYPES(data.type, TYPES.dataHandler.type) || TYPES(data.type, TYPES.streamHandler.type) || TYPES(data.type, TYPES.errorHandler.type)) {
        return new Enny.Handler({
            to: data.to
          , isStream: TYPES(data.type, TYPES.streamHandler)
          , isError: TYPES(data.type, TYPES.errorHandler)
          , args: data.args
          , handler: data.handler
        }).toFlow();
    // Handle load
    } else if (TYPES(data.type, TYPES.load.type)) {
        return new Enny.Handler({
            args: [[data.target]],
            handler: TYPES.load.handler
        }).toFlow();
    // Emit
    } else if (TYPES(data.type, TYPES.emit.type)) {
        return new Enny.Handler({
            args: [data.event]
          , handler: TYPES.emit.handler
          , to: data.to
        }).toFlow();
    }
};

Enny.TYPES = TYPES;

module.exports = Enny;
