TimelineInputController = function(element, timeline) {

	var MODE_IDLE = 'idle';
	var MODE_DRAGGING = 'dragging';
	var MODE_SLIDING_ANIM = 'sliding-anim';
	var MODE_ZOOMING = 'zooming';

	var p = {};

	p._mode = MODE_IDLE;

	p._el = $(element);
	p._tc = timeline;
	p.fh = new FingerIdHelper();
	p.width = p._el.width();
	// console.log('width='+p.width);
	p._tc.setWidth(p.width);

	p.drag_down_x = 0;
	p.drag_down_t = 0;
	p.drag_down_o = 0;
	p.draw_down_p = 0;
	p.draw_down_s = 0;

	p.zoom_down_lp = 0;
	p.zoom_down_rp = 0;
	p.zoom_down_t1 = 0;
	p.zoom_down_t2 = 0;

	p._hack1 = false;
	p._hack2 = false;
	p._lastx = 0;
	p._lasty = 0;

	p.anim_start_o = 0;
	p.anim_end_o = 0;
	p.anim_time = 0;
	p.anim_timer = 0;

	p._points = [{
		x : 0,
		y : 0,
		t : 0,
		down : false
	},{
		x : 0,
		y : 0,
		t : 0,
		down : false
	} ,{
		x : 0,
		y : 0,
		t : 0,
		down : false
	} ];

	p._update = function() {
		if (p._mode == MODE_DRAGGING) {

			var n1x = p._points[0].x * 100 / p.width;

			var h = new PanZoomHelper();
			var i = {
				o: {
					l:p.drag_down_p,
					r:p.drag_down_p
				},
				n: {
					l:n1x,
					r:n1x
				}
			};
			var o = h.calcPan(i);

			p._tc.setTimeOffset( p.drag_down_o - (p.drag_down_s * o / 100) );

		} else if (p._mode == MODE_ZOOMING) {

			var n1x = p._points[0].x * 100 / p.width;
			var n2x = p._points[1].x * 100 / p.width;

			var h = new PanZoomHelper();
			var i = {
				t1:p.zoom_down_t1,
				t2:p.zoom_down_t2,
				o: {
					l:p.zoom_down_lp,
					r:p.zoom_down_rp
				},
				n: {
					l:n1x,
					r:n2x
				}
			};
			var o = h.calcNewTimes(i);
			// console.log('span='+n1x+'-'+n2x+' t='+o.t1+'-'+o.t2);
			p._tc.setTimeRange(o.t1,o.t2);
		}
	};
	p.easeOutQuad = function(t) {
		return -t * (t-2);
	};
	p._timertick = function() {
		var t1 = p.anim_time / p.anim_duration;
		var t =	p.easeOutQuad(t1);
		var o = p.anim_start_o + (p.anim_end_o - p.anim_start_o)*t;
		// console.log('anim; t1='+t1+', t='+t+', o='+o);
		p._tc.setTimeOffset(o);
		p.anim_time += 0.03;
		if( p._mode != MODE_SLIDING_ANIM )
			return;
		if( p.anim_time < p.anim_duration)
			setTimeout( function() {
				p._timertick();
			}, 30);
		else
			p._changemode(MODE_IDLE);
	};
	p._changemode = function(newmode) {
		if (newmode == p._mode)
			return;

		// console.log('newmode', newmode, 'oldmode', p._mode);
		if( newmode == MODE_SLIDING_ANIM ) {
			p.anim_time = 0;
			setTimeout( function() {
				p._timertick();
			}, 1);
		} else if (newmode == MODE_DRAGGING && p._mode == MODE_IDLE) {

			//	console.log('begin dragging (0p -> 1p)');

			p.drag_down_o = p._tc.getTimeOffset();
			p.drag_down_p = p._points[0].x * 100 / p.width;
			p.drag_down_s = p._tc.getTimeSpan();

		} else if (newmode == MODE_DRAGGING && p._mode == MODE_ZOOMING) {

			//	console.log('begin dragging after zooming (2p -> 1p)');

		} else if (newmode == MODE_ZOOMING && p._mode == MODE_DRAGGING) {

			// console.log('begin zooming after dragging (1p -> 2p)');

			// console.log('width='+p.width);

			p.zoom_down_lp = p._points[0].x;
			p.zoom_down_rp =  p._points[1].x;
			// console.log('lp='+p.zoom_down_lp+', rp='+p.zoom_down_rp);

			p.zoom_down_t1 = p._tc.getTimeOffset();
			p.zoom_down_t2 = p._tc.getTimeOffset() + p._tc.getTimeSpan();
			// console.log('t1='+p.zoom_down_t1+', t2='+p.zoom_down_t2);

			p.zoom_down_lp = p.zoom_down_lp * 100 / p.width;
			p.zoom_down_rp = p.zoom_down_rp * 100 / p.width;
			// console.log('lp2='+p.zoom_down_lp+', rp2='+p.zoom_down_rp);

		} else if (newmode == MODE_IDLE && p._mode == MODE_ZOOMING) {

			//		console.log('idle from zooming (2p -> 0p)');
			//

			//	var t1 = _tc.getTimeOffset();
			//	var t2 = _tc.getTimeOffset() + _tc.getTimeSpan();
			//	console.log('after t1='+t1+', t2='+t2);

		} else if (newmode == MODE_IDLE && p._mode == MODE_DRAGGING) {

			//	console.log('idle from dragging (1p -> 0p)');
			// var t = _tc.getTimeFromPosition(_points[0].x);
			//	_tc.setTimeOffset(drag_down_o - (t - drag_down_t));

		}
		p._mode = newmode;
	};
	var ret = {
		touchDown : function(x, y, n) {
			// console.log('touchDown: x=' + x + ', n=' + n);
			var idx = n - 1;
			if (typeof (p._points[idx]) != 'undefined' && p._points[idx].down)
				return;
			if(n > 2 )
				return;

			var _firstdown = (!p._points[0].down && !p._points[1].down);
			var _seconddown = (p._points[0].down || p._points[1].down);

			p._points[idx] = {
				x : x,
				y : y,
				t : p._tc.getTimeFromPosition(x),
				down : true
			};

			if (_firstdown)
				p._changemode(MODE_DRAGGING);
			//			else if (_seconddown)
			//			_changemode(MODE_ZOOMING);
			p._update();
		},
		touchMove : function(x, y, n) {
			var idx = n - 1;
			if (typeof (p._points[idx]) == 'undefined' || !p._points[idx].down)
				return;
			if(n > 2 )
				return;
			p._points[idx].x = x;
			p._points[idx].y = y;
			p._points[idx].t = p._tc.getTimeFromPosition(x);
			p._update();
		},
		touchUp : function(n) {
			// console.log('touchUp: n=' + n);
			var idx = n - 1;
			if (typeof (p._points[idx]) == 'undefined' || !p._points[idx].down)
				return;
			if(n > 2 )
				return;
			var _onedown = (p._points[0].down || p._points[1].down);
			var _bothdown = (p._points[0].down && p._points[1].down);

			p._points[idx].down = false;
			/*			if( _onedown ) {
			 var o = p._tc.getTimeOffset();
			 p.anim_duration = 1.0;
			 p.anim_end_o = o + (o - p.drag_down_o);
			 p.anim_start_o = o;
			 p._changemode(MODE_SLIDING_ANIM);
			 } else*/ {
			p._changemode(MODE_IDLE);
			}
		},
		animateTo: function(nc) {
			p.anim_duration = 1.0;
			p.anim_end_o = nc - p._tc.getTimeSpan()/2;
			p.anim_start_o = p._tc.getTimeOffset();
			p._changemode(MODE_SLIDING_ANIM);
		}
	};

	p._hack = 0;

	p._el.bind('touchstart', function(e) {
		e.preventDefault();
		var ta = e.originalEvent.touches;
		for ( var k = 0; k < ta.length; k++) {
			var x = ta[k].pageX;
			var y = ta[k].pageY;
			var id = ta[k].identifier;
			var idx = p.fh.add(id,x,y);
			ret.touchDown(x, y, idx);
		}
	});
	p._el.bind('touchend', function(e) {
		e.preventDefault();
		var ta = e.originalEvent.changedTouches;
		for ( var k = 0; k < ta.length; k++) {
			var id = ta[k].identifier;
			var idx = p.fh.get(id);
			p.fh.remove(id);
			ret.touchUp(idx);
		}
	});
	p._el.bind('touchmove', function(e) {
		var ta = e.originalEvent.touches;
		for ( var k = 0; k < ta.length; k++) {
			var x = ta[k].pageX;
			var y = ta[k].pageY;
			var id = ta[k].identifier;
			var idx = p.fh.get(id);
			ret.touchMove(x, y, idx);
		}
	});
	p._el.bind('touchcancel', function(e) {
		e.preventDefault();
		var ta = e.originalEvent.targetTouches;
		for ( var k = 0; k < ta.length; k++) {
			var id = ta[k].identifier;
			var idx = p.fh.get(id);
			p.fh.remove(id);
			ret.touchUp(idx);
		}
	});
	p._el.mousedown( function(e) {
		if (p._hack != 0)
			return;
		ret.touchDown(e.pageX, e.pageY, 1);
	});
	p._el.mousemove( function(e) {
		p._lastx = e.pageX;
		p._lasty = e.pageY;
		if (p._hack != 0)
			return;
		ret.touchMove(e.pageX, e.pageY, 1);
	});
	p._el.mouseup( function(e) {
		if (p._hack != 0)
			return;
		ret.touchUp(1);
	});
	$(document).keydown( function(e) {
		// console.log('key down ' + e.keyCode);
		switch (e.keyCode) {
			case 81:
				p._hack |= 1;
				ret.touchDown(p._lastx, p._lasty, 1);
				break;
			case 65:
				ret.touchMove(p._lastx, p._lasty, 1);
				break;
			case 90:
				p._hack &= ~1;
				ret.touchUp(1);
				break;
			case 87:
				p._hack |= 2;
				ret.touchDown(p._lastx, p._lasty, 2);
				break;
			case 83:
				ret.touchMove(p._lastx, p._lasty, 2);
				break;
			case 88:
				p._hack &= ~2;
				ret.touchUp(2);
				break;
			case 49:
				break;
			case 50:
				break;
			case 27:
				break;
		}
	});
	return ret;
};