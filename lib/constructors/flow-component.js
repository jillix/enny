"use strict";

const flowTypes = require("engine-flow-types");

function flowComponent(data) {

    // Emit
    if (data.emit) {
        return new flowTypes.Emit(
            data.emit
          , data
        );
    }

    // Data handler
    if (data.dataHandler) {
        return new flowTypes.DataHandler(
            data.dataHandler
          , data
          , data.data
        );
    }

    // Stream handler
    if (data.streamHandler) {
        return new flowTypes.StreamHandler(
            data.streamHandler
          , data
          , data.data
        );
    }
}

module.exports = flowComponent;
