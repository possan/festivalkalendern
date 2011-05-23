window["eventdb"] = (function() {
	var p = {
		ymcache : [],
		allevents : [],
		obs : new Observable()
	};
	var ret = {
		ensureCache : function(monthtag) {

		},
		addListener : function(l) {
			p.obs.addListener(l);
		}
	};
	return ret;
})();