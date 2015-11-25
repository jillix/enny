"use strict";

// Dependencies
var ul = require("ul")
  , ObjectMap = require("map-o")
  , iterateObject = require("iterate-object")
  , Instance = require("./constructors/instance")
  , addEnny = require("./generators")
  ;

class Enny {
    /**
     * Enny
     * Create a new Enny instance
     *
     * @name Enny
     * @function
     * @return {Enny} The `Enny` instance.
     */
    constructor () {
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
    toObject () {
        return JSON.parse(JSON.stringify(this));
    }

    /**
     * renameInstance
     * Renames the specified instance. This will update the instance references in the entire app.
     *
     * @name renameInstance
     * @function
     * @param {String} oldName The old instance name.
     * @param {String} newName The new instance name.
     * @param {Function} cb The callback function.
     */
    renameInstance (oldName, newName, cb) {

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
    }

    /**
     * toJSON
     * This function is called internally when `JSON.stringify`-ing the things.
     *
     * @name toJSON
     * @function
     * @return {Object} The object that should be stringified.
     */
    toJSON () {
        var self = this;
        var obj = {};
        Object.keys(self.instances).forEach(function (name) {
            obj[name] = self.instances[name]._;
        });
        return obj;
    }

    /**
     * addInstance
     * Adds a new instance.
     *
     * @name addInstance
     * @function
     * @param {Object} ins The Engine instance you want to add.
     * @return {Instance} The instance object.
     */
    addInstance (ins) {
        ins = this.Instance(ins);
        this.instances[ins._.name] = ins;
        return ins;
    }
}

module.exports = Enny;
