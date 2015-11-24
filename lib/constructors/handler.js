class Handler {
    /**
     * Handler
     * Creates a new `Handler` instance.
     *
     * @name Handler
     * @function
     * @param {Object} data An object containing the following fields:
     *
     *  - `to` (String): The target instance name.
     *  - `args` (Array): Additional arguments in the handler call.
     *  - `isStream` (Boolean): If `true`, the handler will be a stream handler.
     *  - `handler` (String): The method name.
     *  - `isLink` (Boolean): If `true`, the handler will be a server side method (called from the client)–aka *link*.
     *
     * @return {Handler} The `Handler` instance:
     */
    constructor (data) {
        if (Typpy(data) === "handler") {
            return data;
        }
        this.to = data.to;
        this.args = Deffy(data.args, []);
        this.isStream = Deffy(data.isStream, true);
        this.isError = Deffy(data.isError, false);
        this.handler = data.handler;
        this.isLink = data.isLink;
        if (this.args.length && data.isLink) {
            this.args[0] = "@" + (this.to ? this.to + "/" : "") + this.args[0];
        }
    }

    /**
     * toFlow
     * Converts the internal data into a Engine syntax flow array.
     *
     * @name toFlow
     * @function
     * @return {Array} The Engine syntax array result.
     */
    toFlow () {
        var res = [];
        res[0] = (this.isStream ? "" : this.isError ? "!" : ":") + (this.to && !this.isLink ? this.to + "/" : "") + this.handler;
        if (!this.args.length) {
            return res[0];
        }
        res = res.concat(this.args);
        return res;
    }
}
