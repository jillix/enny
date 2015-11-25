var flowTypes = require("engine-flow-types")

flowTypes.Emit.prototype.enny = function () {
    return [];
};

flowTypes.DataHandler.prototype.enny = function () {
    return [];
};

flowTypes.StreamHandler.prototype.enny = function () {
    return [];
};

flowTypes.Listener.prototype.enny = function () {
    var event = {
        data: this.data.map(c => c.enny())
      , error: null
      , end: null
    };
    return event;
};
