var Ul = require("ul");
var Typpy = require("typpy");
var Deffy = require("deffy");

const TYPES = {
    event: "event",
    dataHandler: "dataHandler",
    streamHandler: "streamHandler",
    load: "load"
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

Enny.prototype.toJSON = function (a, b, c) {
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
    res.concat(this.args);
    return res;
};

Enny.FlowComponent = function FlowComponent (data) {
    var self = this;
    if (Typpy(data) === "flowcomponent") {
        return data;
    }
    if (data.event) {
        data.type = TYPES.event;
    }
    self.data = Ul.clone(data);
};

Enny.FlowComponent.prototype.toFlow = function () {
    var data = this.data;
    var res = null;
    switch (data.type) {
        case TYPES.event:
            if (data.once) {
                return [data.event];
            }
            return data.event;
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

module.exports = Enny;
