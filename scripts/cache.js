(function(target) {

	if (!Array.indexOf) {
		Array.prototype.indexOf = function(obj, start) {
			for ( var i = (start || 0); i < this.length; i++) {
				if (this[i] == obj) {
					return i;
				}
			}
			return -1;
		}
	}

	target["AsyncCache"] = function(arg) {

		var p = {
			providers : [],
			data : {},
			loading : [],
			queue : []
		};

		if (typeof (arg) == 'Array')
			p.providers = arg;

		p.isReady = function(key) {
			return (typeof (p.data[key]) != 'undefined');
		}

		p.isLoading = function(key) {
			return (p.loading.indexOf(key) != -1);
		}

		p.markLoading = function(key) {
			p.loading.push(key);
		}

		p.unmarkLoading = function(key) {
			for ( var k = p.loading.length - 1; k >= 0; k--)
				if (p.loading[k] == key)
					p.loading.splice(k, 1);
		}

		this["addProvider"] = function(cb) {
			p.providers.push(cb);
		};

		this["set"] = function(key, value) {
			// console.log('AsyncCache: got data for key:' + key, value);

			p.data[key] = value;
			// mark as loaded.
			p.unmarkLoading(key);
			// find items dependant on us...
			var idxs = [];
			var calls = [];
			for ( var k = 0; k < p.queue.length; k++)
				if (p.queue[k].key == key) {
					idxs.push(k);
					calls.push(p.queue[k].callback);
				}
			// remove them from queue.
			for ( var k = idxs.length - 1; k >= 0; k--)
				p.queue.splice(idxs[k]);
			// call the callbacks
			setTimeout(function() {
				for ( var k = 0; k < calls.length; k++)
					calls[k].apply(this, [ value ]);
			}, 0);
		};

		this["get"] = function(key, cb) {

			// already cached?
			if (typeof (p.data[key]) != 'undefined') {
				setTimeout(function() {
					cb.apply(this, [ p.data[key] ]);
				}, 0);
				return;
			}

			// queue callback when ready.
			p.queue.push( {
				key : key,
				callback : cb
			});

			// stop if already loading
			if (p.isLoading(key))
				return;

			// console.log('AsyncCache: get data for key:' + key);

			// mark as loading..
			p.markLoading(key);

			// tell all providers to start loading...
			for ( var k = 0; k < p.providers.length; k++) {
				p.providers[k].apply(this, [ this, key ]);
			}
		};
	}

	target["AsyncCache"] = AsyncCache;

})(window);