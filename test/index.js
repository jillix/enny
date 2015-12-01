const tester = require("tester")
    , Enny = require("../lib")
;

var e = new Enny();

tester.describe("instances", test => {
    test.it("should be able to add instances", () => {
        e.addInstance({ name: "A" });
        e.addInstance({ name: "B" });
        test.expect(e.instances.A).toBeAn(Object);
        test.expect(e.instances.B).toBeAn(Object);
    });
});

tester.describe("testing flow", test => {
    test.it("add listeners", () => {
        e.instances.A.on("someEvent", {
            emit: "eventToEmit"
    , to: "B"
    , leaking: true
        }, "errorEvent", "endEvent");
    });
    test.it("add new data to the same listener", () => {
        e.instances.A.on("someEvent", [
            {
                dataHandler: "myDataHandler"
    , to: "myInstance"
    , once: true
    , data: {
some: "data"
    }
            }
    , {
streamHandler: "myStreamHandler"
    , leaking: true
    }
        ]);
    });
});

tester.describe("jsonize", test => {
    test.it("should be able to convert everything into object", () => {
        test.expect(e.toObject()).toEqual({
            "A": {
                "flow": {
                    "someEvent": {
                        "data": [
                            [
                                "|*eventToEmit",
                                {
                                    "to": "B"
                                }
                            ],
                            [
                                ".myInstance/myDataHandler",
                                {
                                    "some": "data"
                                }
                            ],
                            "|*myStreamHandler"
                        ],
                        "error": "errorEvent",
                        "end": "endEvent"
                    }
                },
                "name": "A"
            },
            "B": {
                "flow": {},
                "name": "B"
            }
        });
    });
});
