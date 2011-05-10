TimelineController = function() {

	var _obs = new Observable();
	var _zoom = 1.0;
	var _scale = 1.0;
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
				panning : false
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
		setZoom : function(z) {
			if (z == _zoom)
				return;
			_zoom = z;
			_obs.fire({
				zoomed : true,
				panning : false
			});
		},
		getZoom : function() {
			return _zoom;
		},
		setPanOffset : function(p) {
			if (p == _panoffset)
				return;
			_panoffset = p;
			_obs.fire({
				zoomed : false,
				panning : true
			});
		},
		getPanOffset : function() {
			return _panoffset;
		},
		getTimeFromPosition : function(p) {
			_scale = _width / _timespan;
			return _timeoffset + ((p - _panoffset) / _scale);
		},
		getPositionFromTime : function(t) {
			_scale = _width / _timespan;
			return ((t - _timeoffset) * _scale) + _panoffset;
		}
	};

	// ret.initialize(el);

	return ret;
};