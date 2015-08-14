var Ul = require("ul");
var Typpy = require("typpy");
var Deffy = require("deffy");
var IterateObject = require("iterate-object");
var SetOrGet = require("set-or-get");
var ObjectMap = require("map-o");

const TYPES = (function () {

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

    // ["instance/emit", "some-event"]
    types.emit = {
        icon: "f077"
    };

    // ["link", "instance/method"]
    types.link = {
        icon: "f05c",
        handler: "flow"
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

Enny.prototype.toObject = function () {
    return JSON.parse(JSON.stringify(this));
};

Enny.prototype.toJSON = function () {
    var self = this;
    var obj = {};
    Object.keys(self.instances).forEach(function (name) {
        obj[name] = self.instances[name]._;
    });
    return obj;
};

Enny.prototype.addInstance = function (ins) {
    ins = this.Instance(ins);
    this.instances[ins._.name] = ins;
    return ins;
};

Enny.Instance = function Instance (data, options) {
    if (Typpy(data) === "instance") {
        return data;
    }
    this._ = Ul.clone(data);
    this.enny = options.enny;
};

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

Enny.Instance.prototype.addFlow = function (flElm, options, callback) {

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

    flow.push(flElm);

    if (options.save) {
        self.enny.save(callback);
        return self;
    }

    callback();
};

Enny.Instance.prototype.toObject = function () {
    return JSON.parse(JSON.stringify(this))._;
};

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

Enny.FlowElement.prototype.toJSON = function () {
    return this._.map(function (c) {
        return c.toFlow();
    });
};

Enny.FlowElement.prototype.addComponent = function (data) {
    data = new Enny.FlowComponent(data);
    this._.push(data);
};

Enny.FlowElement.prototype.toFlow = function () {
    return this._.map(function (c) {
        return c.toFlow();
    });
};

Enny.Handler = function Handler(data) {
    if (Typpy(data) === "handler") {
        return data;
    }
    this.to = data.to;
    this.args = Deffy(data.args, []);
    this.isStream = Deffy(data.isStream, true);
    this.handler = data.handler;
};

Enny.Handler.prototype.toFlow = function () {
    var res = [];
    res[0] = (this.isStream ? "" : ":") + (this.to ? this.to + "/" : "") + this.handler;
    if (!this.args.length) {
        return res[0];
    }
    res = res.concat(this.args);
    return res;
};

Enny.FlowComponent = function FlowComponent (data) {
    var self = this;
    if (Typpy(data) === "flowcomponent") {
        return data;
    }
    if (data.event) {
        data.type = TYPES.listener;
    }
    if (data.stream) {
        data.type = TYPES.streamHandler;
        data.handler = data.stream;
    }
    if (data.link) {
        data.type = TYPES.link;
    }
    self.data = Ul.clone(data);
};

Enny.FlowComponent.prototype.toFlow = function () {
    var data = this.data;
    var res = null;
    switch (data.type) {
        case TYPES.listener.type:
            if (data.once) {
                return [data.event];
            }
            return data.event;
        case TYPES.link.type:
            return new Enny.Handler({
                args: [data.link],
                handler: TYPES.link.handler
            }).toFlow();
        case TYPES.dataHandler.type:
        case TYPES.streamHandler.type:
            return new Enny.Handler({
                to: data.to,
                isStream: TYPES(data.type, TYPES.streamHandler),
                args: data.args,
                handler: data.handler
            }).toFlow();
        case TYPES.load.type:
            return new Enny.Handler({
                args: [[data.instance]],
                handler: TYPES.load.handler
            }).toFlow();
    }
};

// instance/method
// !instance/method
// >instance/method
// :instance/method
// method
Enny.parseMethod = function (input, defaultIns) {
    var output = {
        instance: defaultIns,
        type: TYPES.streamHandler
    };
    switch (input.charAt(0)) {
        case "!":
            output.type = TYPES.errorHandler;
            input = input.substr(1);
            break;
        case ":":
            output.type = TYPES.dataHandler;
            input = input.substr(1);
            break;
        case ">":
            output.disableInput = true;
            output.type = TYPES.streamHandler;
            input = input.substr(1);
            break;
        case "@":
            output.type = TYPES.link;
            input = input.substr(1);
            break;
        default:
            break;
    }

    var splits = input.split("/");
    if (splits.length === 2) {
        output.instance = splits[0];
        output.method = splits[1];
    } else {
        output.method = splits[0];
    }
    return output;
}

Enny.parseFlowComponent = function (_input, instName) {
    var input = Ul.clone(_input);

    if (Typpy(input, String)) {
        input = [input];
    }

    var output = {}
      , eP = null
      , mP = null
      ;

    // Load
    if (input[0] === TYPES.load.handler) {
        output.type = TYPES.load;
        output.args = input.slice(1);
    // Emit/link
    } else if ((eP = Enny.parseMethod(input[0], instName)).method === "flow") {
        if (TYPES((mP = Enny.parseMethod(input[1], instName)).type, TYPES.link)) {
            output.type = TYPES.link;
            output.instance = mP.instance;
            output.serverMethod = mP.method;
        } else {
            output.type = TYPES.emit;
            output.instance = eP.instance;
            output.event = input[1];
        }
    }

    // Stream handler
    if (!output.type) {
        output = Enny.parseMethod(input[0], instName);
        output.args = input.slice(1);
    }

    return output;
};

Enny.instanceFlow = function (_input, name) {
    var output = {
        load: {},
        dataHandler: {},
        errorHandler: {},
        streamHandler: {},
        emit: {},
        listener: {}
    };

    if (!_input.length) {
        return output;
    }

    IterateObject(_input, function (f) {
        // Collect listeners
        output.listener[f[0]] = {
            event: f[0],
            type: TYPES.listener
        };
        IterateObject(f.slice(1), function (c) {
            c = Enny.parseFlowComponent(c, name);
            if (c.instance !== name) { return; }
            output[c.type][c.method] = c;
        });
    });
    return output;
};

Enny.parseFlow = function (_input, instName) {

    var out = {};

    IterateObject(_input, function (elm) {
        var ev = SetOrGet(out, elm[0], []);
        var p = [];
        IterateObject(elm.slice(1), function (comp) {
            p.push(Enny.parseFlowComponent(comp, instName));
        });
        ev.push(p);
    });

    return out;
};

Enny.convertToOn = function (input) {
    if (input.serverMethod || TYPES(input.type, TYPES.emit)) {
        return TYPES.listener;
    }
    return input.type;
};

Enny.lineType = function (source, target) {
    // * -> error
    if (Enny.TYPES(target.type, TYPES.errorHandler)) {
        return "error-in";
    }

    // error -> *
    if (Enny.TYPES(source.type, TYPES.errorHandler)) {
        return "error-out";
    }

    // data -> *
    if (Enny.TYPES(source.type, TYPES.dataHandler)) {
        return "data-out";
    }

    return "normal";
};

Enny.TYPES = TYPES;

module.exports = Enny;
