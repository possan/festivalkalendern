(function(target) {

	var p = {
		ymcache : [],
		allevents : [],
		cache : new AsyncCache(),
		obs : new Observable()
	};

	cache.addProvider(function(cache, key) {
		setTimeout(function() {
			cache.set(key, 'x');
		}, 100);
	});

	var ret = {
		ensureCache : function(monthtag) {
			cache.get(monthtag, function(data) {
				p.obs.fire( {
					event : 'got month',
					monthtag : monthtag,
					data : data
				});
			});
		},
		addListener : function(l) {
			p.obs.addListener(l);
		}
	};

	target["EventDB"] = ret;

})(window);