var Ul = require("ul");
var Typpy = require("typpy");
var Deffy = require("deffy");
var IterateObject = require("iterate-object");
var SetOrGet = require("set-or-get");

const TYPES = {
    // :some/datahandler
    dataHandler: "dataHandler",
    // !some/error-handelr
    errorHandler: "errorHandler",
    // instance/method
    streamHandler: "streamHandler",
    // load
    // TODO
    load: "load",
    // ["instance/emit", "some-event"]
    emit: "emit",
    // ["link", "instance/method"]
    link: "link",
    // "event"
    listener: "listener"
};

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
        case TYPES.listener:
            if (data.once) {
                return [data.event];
            }
            return data.event;
        case TYPES.link:
            return new Enny.Handler({
                args: [data.link],
                handler: TYPES.link
            }).toFlow();
        case TYPES.dataHandler:
        case TYPES.streamHandler:
            return new Enny.Handler({
                to: data.to,
                isStream: data.type === TYPES.streamHandler,
                args: data.args,
                handler: data.handler
            }).toFlow();
        case TYPES.load:
            return new Enny.Handler({
                args: [[data.instance]],
                handler: TYPES.load
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

    var output = {};
    // Load
    if (input[0] === TYPES.load) {
        output.type = TYPES.load;
        output.args = input.slice(1);
    // Emit
    } else if (Enny.parseMethod(input[0]).method === "emit") {
        output.type = TYPES.emit;
        output.args = input.slice(1).map(function (c) {
            return Enny.parseMethod(c, instName);
        });
    }

    // Stream handler
    if (!output.type) {
        output = Enny.parseMethod(input[0], instName);
        output.args = input.slice(1);
    }

    if (output.method === TYPES.link) {
        output.serverMethod = output.args[0];
    }

    return output;
};

Enny.instanceFlow = function (_input, name) {
    var output = {
        // TODO
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
    if (input.serverMethod) {
        return TYPES.listener;
    }
    if (input.type === TYPES.streamHandler) {
        return TYPES.streamHandler;
    }
    debugger
    switch (input) {
        case TYPES.streamHandler:
        case TYPES.link:
        case TYPES.emit:
        case TYPES.listener:
            return TYPES.listener;
        default:
            return null;
    }
};

Enny.TYPES = TYPES;

module.exports = Enny;
