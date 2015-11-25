"use strict";

const ul = require("ul")
    , flowTypes = require("engine-flow-types")
    , flowComponent = require("./flow-component")
    , iterateObject = require("iterate-object")
    ;

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
        this._ = ul.merge(data, {
            flow: {}
        });
        this.flow = {};
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
    on (eventName, component, error, end) {
        var listener = this.flow[eventName] = new flowTypes.Listener(eventName, error, end);
        if (component) {
            listener.addData(component);
        }
        return this;
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
        var res = ul.clone(this._);
        res.flow = {};
        iterateObject(this.flow, (cListener, name) => {
            res.flow[name] = cListener.enny();
        });

        return res;
    }
}

module.exports = Instance;
