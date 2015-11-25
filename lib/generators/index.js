var flowTypes = require("engine-flow-types")

flowTypes.Emit.prototype.enny = function () {
    var ops = {
        to: this.to
      , net: this.net
    };

    if (!ops.to) {
        delete ops.to;
    }
    if (!ops.net) {
        delete ops.net;
    }

    var ev = this.constructor.types.normal.char + this.event;

    if (ops.to || ops.net) {
        return [ev, ops];
    }

    return ev;
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
