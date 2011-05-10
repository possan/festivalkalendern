TimelineInputController = function(element, timeline) {

	var MODE_IDLE = 'idle';
	var MODE_DRAGGING = 'dragging';
	var MODE_DRAGGING_ANIM = 'dragging-anim';
	var MODE_ZOOMING = 'zooming';
	var _mode = MODE_IDLE;

	var _el = $(element);
	var _tc = timeline;
	var fh = new FingerIdHelper();

	var drag_down_x = 0;
	var drag_down_t = 0;
	var drag_down_o = 0;
	var draw_down_p = 0;

	var zoom_down_lp = 0;
	var zoom_down_rp = 0;
	var zoom_down_cp = 0;
	var zoom_down_lt = 0;
	var zoom_down_rt = 0;
	var zoom_down_ct = 0;
	var zoom_down_ra = 0;
	var zoom_down_ts = 0;
	var zoom_down_to = 0;

	var _hack1 = false;
	var _hack2 = false;
	var _lastx = 0;
	var _lasty = 0;

	var _points = [{
		x : 0,
		y : 0,
		t : 0,
		down : false
	},{
		x : 0,
		y : 0,
		t : 0,
		down : false
	} ];

	_changemode = function(newmode) {
		if (newmode == _mode)
			return;
		console.log('newmode', newmode, 'oldmode', _mode);
		if (newmode == MODE_DRAGGING && _mode == MODE_IDLE) {

			console.log('begin dragging (0p -> 1p)');

			drag_down_x = _points[0].x;
			drag_down_t = _tc.getTimeFromPosition(drag_down_x);
			drag_down_o = _tc.getTimeOffset();
			drag_down_p = _tc.getPanOffset();

		} else if (newmode == MODE_DRAGGING && _mode == MODE_ZOOMING) {

			console.log('begin dragging after zooming (2p -> 1p)');

		} else if (newmode == MODE_ZOOMING && _mode == MODE_DRAGGING) {

			console.log('begin zooming after dragging (1p -> 2p)');

			zoom_down_lp = Math.min( _points[0].x, _points[1].x );
			zoom_down_rp = Math.max( _points[0].x, _points[1].x);
			zoom_down_cp = (zoom_down_lp + zoom_down_rp) / 2;

			zoom_down_lt = _tc.getTimeFromPosition(zoom_down_lp);
			zoom_down_rt = _tc.getTimeFromPosition(zoom_down_rp);
			zoom_down_ct = (zoom_down_lt + zoom_down_rt) / 2;

			zoom_down_ra = zoom_down_ct;
			zoom_down_ts = _tc.getTimeSpan();
			zoom_down_to = _tc.getTimeOffset();

		} else if (newmode == MODE_IDLE && _mode == MODE_ZOOMING) {

			console.log('idle from zooming (2p -> 0p)');
			//

		} else if (newmode == MODE_IDLE && _mode == MODE_DRAGGING) {

			console.log('idle from dragging (1p -> 0p)');
			var t = _tc.getTimeFromPosition(_points[0].x);
			//	_tc.setTimeOffset(drag_down_o - (t - drag_down_t));

		}
		_mode = newmode;
	}
	_update = function() {
		// console.log('update', _mode);
		if (_mode == MODE_DRAGGING) {
			// console.log('drag, x', _points[0].x);
			_tc.setPanOffset(drag_down_p + (_points[0].x - drag_down_x));
		} else if (_mode == MODE_ZOOMING) {
			var zoom1 = Math.abs(zoom_down_rp - zoom_down_lp);
			if( zoom1 < 50 )
				zoom1 = 50;
			var zoom2 = Math.abs(_points[1].x - _points[0].x);
			if( zoom2 < 50 )
				zoom2 = 50;
			// console.log('zoom, x1', _points[0].x, 'x2', _points[1].x);
			// console.log('selected timespan', zoom_down_ts * zoom1 / zoom2,
			// 'zoom', zoom2 / zoom1);
			_tc.setPanOffset(0);
			_tc.setTimeOffset(0);
			_tc.setTimeSpan(zoom_down_ts * zoom1 / zoom2);
		}
	};
	var ret = {
		touchDown : function(x, y, n) {
			console.log('touchDown: x=' + x + ', n=' + n);
			var idx = n - 1;
			if (typeof (_points[idx]) != 'undefined' && _points[idx].down)
				return;
			if(n > 2 )
				return;

			var _firstdown = (!_points[0].down && !_points[1].down);
			var _seconddown = (_points[0].down || _points[1].down);

			_points[idx] = {
				x : x,
				y : y,
				t : _tc.getTimeFromPosition(x),
				down : true
			};

			if (_firstdown)
				_changemode(MODE_DRAGGING);
			else if (_seconddown)
				_changemode(MODE_ZOOMING);
			_update();
		},
		touchMove : function(x, y, n) {
			var idx = n - 1;
			if (typeof (_points[idx]) == 'undefined' || !_points[idx].down)
				return;
			if(n > 2 )
				return;
			_points[idx].x = x;
			_points[idx].y = y;
			_points[idx].t = _tc.getTimeFromPosition(x);
			_update();
		},
		touchUp : function(n) {
			console.log('touchUp: n=' + n);
			var idx = n - 1;
			if (typeof (_points[idx]) == 'undefined' || !_points[idx].down)
				return;
			if(n > 2 )
				return;
			var _onedown = (_points[0].down || _points[1].down);
			var _bothdown = (_points[0].down && _points[1].down);

			_points[idx].down = false;

			//	if (_bothdown)
			//		_changemode(MODE_DRAGGING);
			_changemode(MODE_IDLE)
		}
	};

	var _hack = 0;

	_el.bind('touchstart', function(e) {
		// console.log('got touchdown');
		e.preventDefault();
		var ta = e.originalEvent.touches;
		for ( var k = 0; k < ta.length; k++) {
			var x = ta[k].pageX;
			var y = ta[k].pageY;
			var id = ta[k].identifier;
			var idx = fh.add(id);
			// console.log("touchdown x:" + x + " idx:" + idx);
			ret.touchDown(x, y, idx);
		}
	});
	_el.bind('touchend', function(e) {
		// console.log('got touchend');
		e.preventDefault();
		var ta = e.originalEvent.changedTouches;
		for ( var k = 0; k < ta.length; k++) {
			var id = ta[k].identifier;
			var idx = fh.get(id);
			fh.remove(id);
			// console.log("touchup idx:" + idx);
			ret.touchUp(idx);
		}
	});
	_el.bind('touchmove', function(e) {
		// e.preventDefault();
		var ta = e.originalEvent.touches;
		for ( var k = 0; k < ta.length; k++) {
			var x = ta[k].pageX;
			var y = ta[k].pageY;
			var id = ta[k].identifier;
			var idx = fh.get(id);
			ret.touchMove(x, y, idx);
		}
	});
	_el.bind('touchcancel', function(e) {
		// console.log('got touchcancel');
		e.preventDefault();
		var ta = e.originalEvent.targetTouches;
		for ( var k = 0; k < ta.length; k++) {
			var id = ta[k].identifier;
			var idx = fh.get(id);
			fh.remove(id);
			// console.log("touchcancel idx:" + idx);
			ret.touchUp(idx);
		}
	});
	_el.mousedown( function(e) {
		if (_hack != 0)
			return;
		ret.touchDown(e.pageX, e.pageY, 1);
	});
	_el.mousemove( function(e) {
		_lastx = e.pageX;
		_lasty = e.pageY;
		if (_hack != 0)
			return;
		ret.touchMove(e.pageX, e.pageY, 1);
	});
	_el.mouseup( function(e) {
		if (_hack != 0)
			return;
		ret.touchUp(1);
	});
	_el.mousewheel( function(e, delta) {
	});
	$(document).keydown( function(e) {
		console.log('key down ' + e.keyCode);
		switch (e.keyCode) {
			case 81:
				_hack |= 1;
				ret.touchDown(_lastx, _lasty, 1);
				break;
			case 65:
				ret.touchMove(_lastx, _lasty, 1);
				break;
			case 90:
				_hack &= ~1;
				ret.touchUp(1);
				break;
			case 87:
				_hack |= 2;
				ret.touchDown(_lastx, _lasty, 2);
				break;
			case 83:
				ret.touchMove(_lastx, _lasty, 2);
				break;
			case 88:
				_hack &= ~2;
				ret.touchUp(2);
				break;
			case 49:
				break;
			case 50:
				break;
			case 27:
				break;
		}

		/*
		 * if (e.keyCode == 49) { if (_hack1) { } else { } if (_hack1) return;
		 * _hack1 = true; ret.touchDown(_lastx, _lasty, 1); } else if (e.keyCode ==
		 * 50) { if (_hack1) { } else { } if (_hack1) return; _hack1 = true;
		 * ret.touchDown(_lastx, _lasty, 2); } else if (e.keyCode == 27) {
		 * _hack1 = false; _hack2 = false; ret.touchUp(_lastx, _lasty, 1);
		 * ret.touchUp(_lastx, _lasty, 2); }
		 */
	});
	return ret;
};