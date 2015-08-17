var hasWindow = typeof(window) !== "undefined",
    BrowserMutationObserver = hasWindow && (window.MutationObserver || window.WebKitMutationObserver),
    asap, observer, node, index, queue;


if (BrowserMutationObserver) {
    node = document.createTextNode("");
    index = 0;
    queue = [];

    observer = new BrowserMutationObserver(function onObserve() {
        if (queue.length > 0) {
            fn = queue.shift();
            fn();
        }
    });

    observer.observe(node, {
        characterData: true
    });

    asap = function asap(fn) {
        queue[queue.length] = fn;
        index = (index + 1) % 2;
        node.data = index;
    };
} else if (hasWindow && window.setImmediate) {
    asap = function asap(fn) {
        return window.setImmediate(fn);
    };
} else if (hasWindow && window.postMessage && window.addEventListener) {
    queue = [];

    window.addEventListener("message", function onMessage(event) {
        var source = event.source,
            fn;

        if ((source === window || source === null) && event.data === "asap") {
            event.stopPropagation();

            if (queue.length > 0) {
                fn = queue.shift();
                fn();
            }
        }
    }, true);

    asap = function asap(fn) {
        queue[queue.length] = fn;
        window.postMessage("asap", "*");
    };
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
