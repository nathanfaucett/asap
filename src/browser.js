var hasWindow = typeof(window) !== "undefined",
    BrowserMutationObserver = hasWindow && (window.MutationObserver || window.WebKitMutationObserver),
    asap;


function createMutationObserver() {
    var node = document.createTextNode(""),
        index = 0,
        queue = [],
        observer = new BrowserMutationObserver(function onChange() {
            var fn;

            if (queue.length > 0) {
                fn = queue.shift();
                fn();
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
}

function createSetImmediate() {
    return function asap(fn) {
        window.setImmediate(fn);
    };
}

function createMessageEventListener() {
    var queue = [];

    window.addEventListener("message", function onMessage(event) {
        var source = event.source;

        if ((source === window || source === null) && event.data === "asap") {
            event.stopPropagation();

            if (queue.length > 0) {
                queue.shift()();
            }
        }
    }, true);

    return function asap(fn) {
        queue[queue.length] = fn;
        window.postMessage("asap", "*");
    };
}

function createSetTimeout() {
    return function asap(fn) {
        window.setTimeout(fn, 0);
    };
}

function createErrorThrow() {
    return function asap() {
        throw new Error("asap(fn) is not available in this environment");
    };
}


if (BrowserMutationObserver) {
    asap = createMutationObserver();
} else if (hasWindow && window.setImmediate) {
    asap = createSetImmediate();
} else if (hasWindow && window.postMessage && window.addEventListener) {
    asap = createMessageEventListener();
} else if (hasWindow && window.setTimeout) {
    asap = createSetTimeout();
} else {
    asap = createErrorThrow();
}


module.exports = asap;
