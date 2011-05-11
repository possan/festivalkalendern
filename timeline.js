TimelineController = function() {

	var _obs = new Observable();
	var _timeoffset = 0.0;
	var _width = 100;
	var _timespan = 200;
	var _panoffset = 0;

	var ret = {

		addListener : function(cb) {
			_obs.addListener(cb);
		},
		setWidth : function(w) {
			if (w == _width)
				return;
			_width = w;
			_obs.fire({
				zoomed : true,
				panning : true
			});
		},
		getWidth : function() {
			return _width;
		},
		setTimeSpan : function(s) {
			if (s == _timespan)
				return;
			_timespan = s;
			_obs.fire({
				zoomed : true,
				panning : false
			});
		},
		getTimeSpan : function() {
			return _timespan;
		},
		setTimeOffset : function(o) {
			if (o == _timeoffset)
				return;
			_timeoffset = o;
			_obs.fire({
				zoomed : false,
				panning : true
			});
		},
		getTimeOffset : function() {
			return _timeoffset;
		},
		setTimeCenter : function(t,r) {

			var s = r * 2;
			var o = t - r;
			var sc = (s != _timespan);
			var oc = (o != _timeoffset);
			_timeoffset = t - r;
			_timespan = r*2;
			_obs.fire({
				zoomed : sc,
				panning : oc
			});
		},
		setTimeRange : function(t1,t2) {
			var s = t2-t1;
			var o = t1;
			var sc = (s != _timespan);
			var oc = (o != _timeoffset);
			_timeoffset = t1;
			_timespan = t2-t1;
			_obs.fire({
				zoomed : sc,
				panning : oc
			});
		},
		getDisplayOffset: function() {
			return -ret.getPositionFromTime(0);
		},
		getTimeFromPosition : function(p) {
			return _timeoffset + (p / _width) * _timespan;
		},
		getPositionFromTime : function(t) {
			return  (t-_timeoffset) * _width / _timespan;
		}
	};
	return ret;
};