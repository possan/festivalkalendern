//
// JS LOADER 0.1
//

/** @define {boolean} DEBUG */
var DEBUG = true;

/** @constructor */
function Loader(opts) {
    var scope = this.callee;

    /** @private */
    var p = {
        scope: scope,
        ext: 'js',
        root: '',
        deps: {
            loading: [],
            loaded: [],
            ready: []
        },
        nocache: DEBUG
    }

    var ret = {};

    //
    // LOGGING
    //

    p.log = function (var_args) {
        if (DEBUG) {
            var console_ok = false;
            if (typeof (console) != 'undefined') {
                try {
                    console.log.apply(console, arguments);
                    console_ok = true;
                } catch (e) {
                }
            }
            if (!console_ok) {
                var el = document.getElementById('legacydebug');
                if (typeof (el) != 'undefined' && el) {
                    var el2 = document.createElement('div');
                    var str = '';
                    for (var k = 0; k < arguments.length; k++)
                        str += arguments[k] + ' ';
                    // alert(str);
                    el2.innerHTML = str;
                    el.appendChild(el2);
                }
            }
        }
    };

    if (opts && opts["root"])
        p.root = opts["root"];

    if (opts && opts["extension"])
        p.ext = opts["extension"];

    if (opts && opts["nocache"])
        p.nocache = opts["nocache"];

    //
    // Internal jobqueue
    //

    p._jobQueue = [];

    p.queueJob = function (job) {
        if (DEBUG) {
            job.toString = function () {
                var ret = "";
                if (typeof (this.deps) != 'undefined' && this.deps.length > 0)
                    ret += "deps=" + this.deps;
                if (typeof (this.provides) != 'undefined') {
                    if (ret != "")
                        ret += ", ";
                    ret += "provides=" + this.provides;
                }
                // if (ret != "")
                //  ret = " " + ret;
                ret = "[" + ret + "]";
                return ret;
            }
        }
        p._jobQueue.push(job);
        if (DEBUG) {
            p.log('queueJob: queueing ' + job);
            for (var k = 0; k < p._jobQueue.length; k++)
                p.log('queueJob: new queue #' + k + ': ' + p._jobQueue[k]);
        }
    }

    if (DEBUG) 
        p.tickCounter = 0;

    p.combTick = function () {
        if (DEBUG)
            p.tickCounter++;

        if (p._jobQueue.length < 1) {
            DEBUG && p.log('combTick #' + p.tickCounter + '; queue empty.');
            return;
        }

        if (DEBUG) {
            p.log('--------------------------------------------------------------------------');
            p.log('combTick #' + p.tickCounter + '; ' + p._jobQueue.length + ' jobs in queue.');
            p.log('deps.loading: ' + p.deps.loading);
            p.log('deps.loaded: ' + p.deps.loaded);
            p.log('deps.ready: ' + p.deps.ready);
            p.log('--------------------------------------------------------------------------');
        }

        var job = p._jobQueue.splice(0, 1)[0];
        job.handler(job);
    }

    p.lastCombTick = -1;

    p.queueCombTick = function (delay) {
        if (p.lastCombTick != -1)
            clearTimeout(p.lastCombTick);
        if (typeof (delay) == 'undefined')
            delay = DEBUG ? 100 : 1;
        // p.log('queue comb tick; delay=' + delay);
        p.lastCombTick = setTimeout(function () {
            p.lastCombTick = -1;
            p.combTick();
        }, delay);
    }

    //
    // XHR / URL junk
    //

    // from fiji xhr: http://code.google.com/p/xhr/source/browse/trunk/xhr.js
    p.ie_activex = false;
    p.getXHR = function () {
        if (window.XMLHttpRequest) {
            DEBUG && p.log('creating using window.XMLHttpRequest');
            return new XMLHttpRequest();
        } else if (window["ActiveXObject"]) {
            DEBUG && p.log('creating using window.ActiveXObject');
            if (p.ie_activex) {
                return new ActiveXObject(p.ie_activex);
            } else {
                var axs = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
                for (var i = 0; i < axs.length; i++) {
                    try {
                        DEBUG && p.log('trying ' + axs[i]);
                        var xhr = new ActiveXObject(axs[i]);
                        DEBUG && p.log('got ' + xhr);
                        if (xhr) {
                            p.ie_activex = axs[i];
                            return xhr;
                            break;
                        }
                    }
                    catch (e) { /* next */ }
                }
            }
        }
        DEBUG && p.log('no xhr created.');
        return false;
    };

    // modified xhr from xui 2.0.0: http://xuijs.com/downloads/xui-2.0.0.js
    p.xhr = function (url, options) {

        var o = options ? options : {};
        if (typeof options == "function") {
            o = {};
            o.callback = options;
        };
        
        var that = this,
            method = o.method || 'get',
            i = 0;

        var req = p.getXHR();
        if (typeof (req) == 'undefined') {
            DEBUG && p.log('unable to create a xhr');
            return;
        }

        o.error = (o.error && typeof o.error == 'function') ? o.error : function () { };

        req.onreadystatechange = function (a) {
            DEBUG && p.log('req.onreadystatechange', req.readyState);
            if (req.readyState == 4) {
                DEBUG && p.log('req.status', req.status);
                // delete (that.xmlHttpRequest);
                if (req.status === 0 || req.status == 200)
                    o.callback.apply(req, [that]);
                if ((/^[45]/).test(req.status))
                    o.error.apply(req);
            }
        }

        req.open(method, url, true);
        that.xmlHttpRequest = req;
        req.send('');

        return this;
    }

    p.getUrlFromDep = function (dep) {
        var u = p.root + dep + '.' + p.ext;
        if (p.nocache)
            u += '?dummy=' + escape(Math.random());
        return u;
    }

    //
    // List helpers
    //

    if (!Array.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0); i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        }
    }

    /*
    Array.prototype.map = function (cb) {
        var ret = [];
        for (var k = 0; k < this.length; k++) {
            var r = cb(this[k], k);
            for (var i = 0; i < r.length; i++)
                ret.push(r[i]);
        }
        return ret;
    }

    Array.prototype.each = function (cb) {
        for (var k = 0; k < this.length; k++) {
            cb(this[k], k);
        }
        return this;
    }
    */

    Array.prototype.or = function (cb) {
        var ret = false;
        for (var k = 0; k < this.length; k++) {
            var r = cb(this[k], k);
            ret |= r;
        }
        return ret;
    }

    Array.prototype.any = function (items) {
        items = Array.clean(items);
        if (items.length < 1)
            return true;
        var self = this;
        return items.or(function (e, i) { return (self.indexOf(e) != -1); });
    }

    Array.prototype.all = function (items) {
        items = Array.clean(items);
        if (items.length < 1)
            return true;
        if (this.length < 1)
            return false;
        var self = this;
        return !items.or(function (e, i) { return (self.indexOf(e) == -1); });
    }

    Array.clean = function (items) {
        if (typeof (items) == 'undefined')
            return;
        if (typeof (items) == 'string')
            items = [items];
        return items;
    }

    Array.prototype._enableItems = function (items, yes) {
        items = Array.clean(items);
        // p.log('enableItems: ', items, yes);        
        if (typeof (yes) == 'undefined')
            yes = true;
        for (var k = 0; k < items.length; k++) {
            var dep = items[k];
            var i = this.indexOf(dep);
            if (i == -1 && yes) {
                // p.log('Array.enableItems: adding ' + dep);
                this.push(dep);
            }
            else if (i != -1 && !yes) {
                // p.log('Array.enableItems: removing ' + dep);
                this.splice(i, 1);
            }
        }
    }

    Array.prototype.addItems = function (items) {
        this._enableItems(items, true);
    }

    Array.prototype.removeItems = function (items) {
        this._enableItems(items, false);
    }

    //
    // Dependency list
    //

    p.markReady = function (deps) {
        p.deps.ready.addItems(deps);
    }

    p.isReady = function (deps) {
        return p.deps.ready.all(deps);
    }

    p.markLoaded = function (deps) {
        p.deps.loaded.addItems(deps);
    }

    p.isLoaded = function (deps) {
        return p.deps.loaded.all(deps);
    }

    p.markLoading = function (deps, yes) {
        if (typeof (yes) == 'undefined')
            yes = true;
        if (yes)
            p.deps.loading.addItems(deps);
        else
            p.deps.loading.removeItems(deps);
    }

    p.isLoading = function (deps) {
        return p.deps.loading.all(deps);
    }

    //
    // Job workers
    //

    p.createModuleObject = function (donecb) {
        var _d = [];
        var ret = {};
        ret["requires"] = function (deps) {
            if (typeof (deps) == 'string')
                deps = [deps];
            _d = deps;
            return ret;
        }
        ret["provides"] = function (dep, cb) {
            var item = { callback: cb, deps: _d, provides: dep };
            DEBUG && p.log('createModuleObject: provides called:', item);
            // p.queueDepJobs(_d);
            p.queueExec(cb, _d, dep, item);
            p.markLoaded(dep);
            donecb(item);
            _d = [];
            return ret;
        }
        return ret;
    }

    p.resolveDependencyJob = function (job) {
        var dep = job.provides;
        DEBUG && p.log('resolve: trying to resolve dependency: ' + dep);

        if (p.isReady(dep) || p.isLoading(dep) || p.isLoaded(dep)) {
            DEBUG && p.log('resolve: ', dep, ' already loaded, ready or loading...');
            p.queueCombTick();
            return;
        }
        
        /*
        if (typeof (job.deps) != 'undefined') {
            if (p.isLoaded(job.deps)) {
                DEBUG && p.log('resolve: ', job.deps, ' already loaded, skip.');
                // p.queueJob(job); 
                // try again later
                p.queueCombTick();
                return;
            }
        }
        */

        p.markLoading(dep, true);
        var url = p.getUrlFromDep(dep);
        DEBUG && p.log('resolve: Resolving dependency: ' + dep + ' from ' + url);
        // p.log('resolve: downloading', url);
        DEBUG && p.log('-----xhr-----');
        p.xhr(url, { callback: function () {
            p.markLoading(dep, false); // done loading
            var that = this;
            DEBUG && p.log('resolve: downloaded', this.responseText);
            // wrap in a function and inject a few objects
            (function () {
                DEBUG && p.log('before create');
                var fn = new Function("module", "loader", that.responseText);
                DEBUG && p.log('created', fn);
                var module = p.createModuleObject(function (data) {
                    DEBUG && p.log('resolve: Module created from within resolve', data);
                });
                // call it
                DEBUG && p.log('resolve: invoking.');
                fn.apply(this, [module, ret]);
                DEBUG && p.log('resolve: done invoking.');
            })();
            p.queueCombTick();
        }, error: function () {
            DEBUG && p.log('resolve: failed to load', u);
            p.queueJob(job); // try again later
            p.queueCombTick();
        }
        });
    };


    p.executeJob = function (job) {
        DEBUG && p.log('exec: ' + job);

        if (!p.isReady(job.deps)) {
            DEBUG && p.log('exec: some missing dependencies', job.deps);
            p.queueDepJobs(job.deps);
            p.queueJob(job); // try again later
            p.queueCombTick();
            return;
        }

        DEBUG && p.log('exec: dependencies are met, run!');
        job.callback.apply(p.scope);
        if (typeof (job.provides) != 'undefined')
            p.markReady(job.provides);
        p.queueCombTick();
    };

    p.queueExec = function (callback, deps, provides, item) {
        p.queueJob({
            handler: p.executeJob,
            item: item,
            callback: callback,
            deps: deps,
            provides: provides
        });
    }

    p.queueResolve = function (dep) {
        p.queueJob({
            handler: p.resolveDependencyJob,
            provides: dep
        });
    }








    p.queueDepJobs = function (deps) {
        // p.log('queueDepJobs: ', deps);
        if (typeof (deps) == 'undefined')
            return;
        if (typeof (deps) == 'string')
            deps = [deps];
        for (var k = 0; k < deps.length; k++) {
            var dep = deps[k];
            if (p.isLoaded(dep)) {
                DEBUG && p.log('queueDepJobs: dependency already loaded: ' + dep);
                continue;
            }
            if (p.isReady(dep)) {
                DEBUG && p.log('queueDepJobs: dependency already ready: ' + dep);
                continue;
            }
            if (p.isLoading(dep)) {
                DEBUG && p.log('queueDepJobs: dependency already loading: ' + dep);
                continue;
            }
            DEBUG && p.log('queueDepJobs: queueing resolve dependency job: ' + dep);
            p.queueResolve(dep);
        }
    }



    p.innerRun = function (callback, deps) {
        DEBUG && p.log('innerRun: called with deps=', deps, 'callback=', callback);

        if (typeof (deps) == 'string')
            deps = [deps];
        if (typeof (deps) == 'undefined')
            deps = [];

        DEBUG && p.log('innerRun: queue all dependencies');
        if (p.isReady(deps)) {
            DEBUG && p.log('innerRun: all dependencies satisfied, run now.');
            callback.apply(p.scope);
            p.queueCombTick();
            return;
        }

        DEBUG && p.log('innerRun: queue later.');
        // p.queueDeps(deps);
        p.queueExec(callback, deps, undefined, undefined);
        p.queueCombTick();
    }

    ret["module"] = p.createModuleObject(function () {
        DEBUG && p.log('Module created from Loader, start ticks');
    });

    ret["load"] = function (dep) {
        p.queueDepJobs(dep);
        p.queueCombTick();
    };

    ret["requires"] = function (deps, cb) {
        p.innerRun(cb, deps);
    };
    ret["require"] = function (deps, cb) {
        p.innerRun(cb, deps);
    };

    ret["run"] = function (callback, deps) {
        p.innerRun(callback, deps);
    };

    p.queueCombTick(); // tick tock...
    DEBUG && p.log('ready.');

    return ret;
}
window["Loader"] = Loader;