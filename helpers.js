FingerIdHelper = function() {
	var _avail = [];
	var _ids = {};
	var _nextindex = 1;
	var ret = {
		add : function(touchid) {
			console.log('add finger ' + touchid);
			var id = _nextindex;
			var idx = _avail.indexOf(touchid);
			console.log('added id ' + id);
			if (idx == -1)
				_avail.push(touchid);
			_ids[touchid] = id;
			_nextindex++;
			return id;
		},
		get : function(touchid) {
			var idx = _avail.indexOf(touchid);
			if (idx != -1)
				return _ids[touchid];
			return -1;
		},
		remove : function(touchid) {
			console.log('remove finger ' + touchid);
			var idx = _avail.indexOf(touchid);
			console.log('removing idx ' + idx);
			if (idx != -1)
				_avail.splice(idx, 1);
			if (_avail.length < 1) {
				console.log('removed last');
				_nextindex = 1;
			}
		}
	}
	return ret;
};
PanZoomHelper = function() {
	ret = {};
	ret.calcSpan = function(ps) {
		return Math.abs(ps.r - ps.l);
	};
	ret.calcCenter = function(ps) {
		return Math.abs(ps.r + ps.l)/2;
	};
	ret.calcRadius = function(ps) {
		return Math.abs(ps.r - ps.l)/2;
	};
	ret.calcZoom = function(inp) {
		var ops = ret.calcSpan( inp.o );
		var nps = ret.calcSpan( inp.n );
		return (100 * nps) / ops;
	};
	ret.calcPan = function(inp) {
		var oc = ret.calcCenter( inp.o );
		var nc = ret.calcCenter( inp.n );
		return nc - oc;
	};
	ret.calcTimeInRange = function(percent,t1,t2) {
		percent = Math.min( 100, Math.max( 0, percent ));
		return (t2 * percent / 100) + (t1 * (100 - percent) / 100);
	}
	ret.calcNewTimesFromPanZoom = function(inp) {
		var s1 = {
			l:inp.t1,
			r:inp.t2
		};
		var ts = ret.calcSpan(s1);
		var tc = ret.calcCenter(s1);
		var tr = ret.calcRadius(s1);
		var nc = tc + (ts * inp.p) / 100;
		var nr = (tr * inp.z) / 100;
		var ret2 = {
			t1: nc-nr,
			t2: nc+nr
		}
		return ret2;
	};
	ret.calcNewTimes = function(inp) {
		var p = ret.calcPan(inp);
		var z = ret.calcZoom(inp);
		var i = {
			t1:inp.t1,
			t2:inp.t2,
			p:p,
			z:z
		}
		var ret2 = ret.calcNewTimesFromPanZoom(i);
		return ret2;
	}
	return ret;
};