"use strict";

const ul = require("ul")
    , flowTypes = require("engine-flow-types")
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
        this._ = ul.clone(data, {
            flow: {}
        });
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
    on (eventName, component) {
        var listener = this.flow[eventName] = new Listener(eventName);
        if (component) {
            listener.addComponent(component);
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
        return JSON.parse(JSON.stringify(this))._;
    }
}

module.exports = Instance;
