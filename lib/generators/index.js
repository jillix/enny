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

    var ev = this.constructor.types[
        this.leaking ? "leaking" : "normal"
    ].char + this.event;

    if (ops.to || ops.net) {
        return [ev, ops];
    }

    return ev;
};

flowTypes.DataHandler.prototype.enny = function () {
    var v = this.get()
      , types = this.constructor.types
      ;

    v[0] = types[this.once ? "once" : "normal"].char + v[0];

    return this.toFlow(v);
};

flowTypes.StreamHandler.prototype.enny = function () {
    var v = this.get()
      , types = this.constructor.types
      ;

    v[0] = types[this.leaking ? "leaking" : "normal"].char + v[0];

    return this.toFlow(v);
};

flowTypes.Listener.prototype.enny = function () {
    var event = {
        data: this.data.map(c => c.enny())
      , error: this.error
      , end: this.end
    };
    return event;
};
