class Instance {
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
    constructor (data, options) {
        if (Typpy(data) === "instance") {
            return data;
        }
        this._ = Ul.clone(data);
        if (this._.client) {
            delete this._.client.flow;
        }
        delete this._.flow;
        this.enny = options.enny;
    }

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
    connect (ins, options, callback) {

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
    }

    /**
     * addFlow
     * Adds a set of FlowElements to the current instance.
     *
     * @name addFlow
     * @function
     * @param {Array} flow An array of human-readable objects, interpreted by `FlowElement`.
     * @param {Object} options The object passed to `FlowElement`.
     */
    Enny.Instance.prototype.addFlow = function (flow, options) {
        var self = this;
        flow.forEach(function (c) {
            self.addFlowElement(c, options);
        });
    }

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
    addFlowElement (flElm, options, callback) {

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
    }

    /**
     * toObject
     * Converts the internal composition into object format.
     *
     * @name toObject
     * @function
     * @return {Object} The prepared composition as object.
     */
    toObject () {
        return JSON.parse(JSON.stringify(this))._;
    }
}

module.exports = Instance;
