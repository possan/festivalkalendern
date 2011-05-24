//
// JS READY 0.1
//

/** @define {boolean} DEBUG */
var DEBUG = true;

window["ready"] = (function () {
    var w = window;

    /** @private */
    var p = {
        queue: [],
        initialized: false,
        readyalready: false
    };

    p.readyCallback = function () {
        if (p.readyalready)
            return;
        p.readyalready = true;
        for (var k = 0; k < p.queue.length; k++) {
            var item = p.queue[k];
            try {
                item.callback.apply(item.scope);
            } catch (e) {
            }
        }
        p.queue = [];
    };

    if (!p.initialized) {
        p.initialized = true;
        var d = document;
        if (d.readyState === "complete") {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            setTimeout(p.readyCallback, 1);
        } else {
            // var l1 = ;
            // var l2 = ;
            if (d.addEventListener) {
                // console.log('registering handlers with addEventListener');
                d.addEventListener('load', p.readyCallback, false);
                d.addEventListener('DOMContentLoaded', p.readyCallback, false);
            } else if (d.attachEvent) {
                //console.log('registering handlers with attachEvent');
                d.attachEvent('onload', p.readyCallback);
                d.attachEvent('onreadystatechange', p.readyCallback);
                w.attachEvent("onload", p.readyCallback);
            }
        }
    }

    return function (cb) {
        var scope = this.callee ? this.callee : this;
        if (p.readyalready) {
            setTimeout(function () {
                cb.apply(scope);
            }, 1);
            return;
        }
        // queue it.
        p.queue.push({
            callback: cb,
            scope: scope
        });
    };
})();
