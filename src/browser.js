var hasWindow = typeof(window) !== "undefined",
    BrowserMutationObserver = hasWindow && (window.MutationObserver || window.WebKitMutationObserver),
    asap;


if (BrowserMutationObserver) {
    asap = (function createMutationObserver() {
        var node = document.createTextNode(""),
            index = 0,
            queue = [],
            observer = new BrowserMutationObserver(function onChange() {
                if (queue.length > 0) {
                    queue.shift()();
                }
            });

        observer.observe(node, {
            characterData: true
        });

        return function asap(fn) {
            queue[queue.length] = fn;
            index = (index + 1) % 2;
            node.data = index;
        };
    }());
} else if (hasWindow && window.setImmediate) {
    asap = function asap(fn) {
        window.setImmediate(fn);
    };
} else if (hasWindow && window.postMessage && window.addEventListener) {
    asap = (function createMessageEventListener() {
        var queue = [];

        window.addEventListener("message", function onMessage(event) {
            var source = event.source;

            if ((source === window || source === null) && event.data === "__ASAP_MESSAGE__") {
                event.stopPropagation();

                if (queue.length > 0) {
                    queue.shift()();
                }
            }
        }, true);

        return function asap(fn) {
            queue[queue.length] = fn;
            window.postMessage("__ASAP_MESSAGE__", "*");
        };
    }());
} else if (hasWindow && window.setTimeout) {
    asap = function asap(fn) {
        window.setTimeout(fn, 0);
    };
} else {
    asap = function asap() {
        throw new Error("asap(fn) is not available in this environment");
    };
}


module.exports = asap;
