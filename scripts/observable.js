(function(target) {

	target["Observable"] = function() {
		var _listeners = [];
		var _fire = function(args) {
			$.each(_listeners, function() {
				this.call(this, args);
			});
		};
		var _add = function(cb) {
			_listeners.push(cb);
		};
		var ret = {
			addListener : _add,
			fire : _fire,
			call : _fire
		};
		return ret;
	};

	target["MockObserver"] = function() {
		var locals = {
			lastarg : '',
			callcount : 0
		}
		locals.listener = function(arg) {
			locals.lastarg = arg;
			locals.callcount++;
		};
		return locals;
	};

})(window);
