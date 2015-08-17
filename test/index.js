var tape = require("tape"),
    asap = require("..");


tape("asap(fn) should handle as soon as possible on next sync run", function(assert) {
    var value = 0;

    function fn0() {
        asap(fn1);
        assert.equals(value, 0);
        value = 1;
    }

    function fn1() {
        assert.equals(value, 1);
        assert.end();
    }

    asap(fn0);
});
