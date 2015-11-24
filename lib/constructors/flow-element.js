class FlowElement {
    /**
     * FlowElement
     * Creates a new instance of `FlowElement`.
     *
     * @name FlowElement
     * @function
     * @param {Array} data The flow element.
     * @return {FlowElement} The `FlowElement` instance.
     */
    constructor (data) {
        var self = this;
        if (Typpy(data) === "flowelement") {
            return data;
        }
        this._ = [];
        if (Typpy(data) === "array") {
            data.forEach(self.addComponent.bind(self));
        }
    }

    /**
     * toJSON
     * This is called internally when `JSON.stringify`-ing the things.
     *
     * @name toJSON
     * @function
     * @return {Array} The array that is stringified.
     */
    toJSON () {
        return this._.map(function (c) {
            return c.toFlow();
        });
    }

    /**
     * addComponent
     * Adds a new component.
     *
     * @name addComponent
     * @function
     * @param {FlowComponent|Object} data The flow component object or just an object that is wrapped by FlowComponent.
     */
    addComponent (data) {
        data = new Enny.FlowComponent(data);
        this._.push(data);
    }

    /**
     * toFlow
     * Converts the internal data into a Engine syntax flow array.
     *
     * @name toFlow
     * @function
     * @return {Array} The flow array.
     */
    toFlow () {
        return this._.map(function (c) {
            return c.toFlow();
        });
    }
}

module.exports = FlowElement;
