"use strict";

class FlowComponent {
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
    constructor (data) {
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
    }
}

module.exports = FlowComponent;
