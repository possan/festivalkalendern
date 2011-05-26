$(document).ready(function() {

	var eventdb = new EventDB('http://festivalkalendern.se/db.php?date={0}');

	var outerel = $('#timeline');
	var timelineel = $('.innertimeline', outerel);
	var eventsel = $('.events', outerel);
	var cursorel = $('.cursor', outerel);
	var todayel = $('.today', outerel);
	var last_month = '';

	var tc = new TimelineController();
	var tic = new TimelineInputController(outerel, tc);
	var ep = new EventPacker();

	var dragging = false;
	var dragtimer = -1;
	var counter = 0;
	/* var allitems = []; */

	var today_date = Date.today();
	var today_time = DateUtilities.PositionFromDate(today_date);
	var cursor_time = today_time + 0;

	function repositionEventElement(el, event) {
		var ppo = Math.round(tc.getDisplayOffset());
		var lp = Math.round(tc.getPositionFromTime(event.left) + ppo);
		var rp = Math.round(tc.getPositionFromTime(event.right) + ppo);
		// console.log(event.title, lp, rp);
		var wp = rp - lp;
		el.css( {
			left : lp + 'px',
			width : wp + 'px'
		});
	}

	updatecursorlabel = function() {
		var cc = tc.getTimeCenter();
		var cd = DateUtilities.DateFromPosition(cc);
		$('.label', cursorel).html(cd.toString("ddd d MMM, yyyy"));
		eventdb.ensureCache(cd.toString('yyyy-MM'));
		var lmt = cd.toString("yyyy-MM");
		if (lmt == last_month)
			return false;
		last_month = lmt;
		return true;
	}

	regeneratepoints = function() {
		var el1 = $('<div>');
		var cp = tc.getTimeCenter();
		var cd = DateUtilities.DateFromPosition(cp);

		var startdate = (new Date(cd)).addMonths(-3);
		var enddate = (new Date(cd)).addMonths(3);

		var mon1 = parseInt(startdate.toString("yyyy")) * 12
				+ parseInt(startdate.toString("M")) - 1;

		var mon2 = parseInt(enddate.toString("yyyy")) * 12
				+ parseInt(enddate.toString("M")) - 1;

		// console.log(mon1, mon2);

		var ppo = tc.getDisplayOffset();
		var cc = tc.getTimeCenter();
		// console.log('ppo=' + ppo + ', cc=' + cc);
		for ( var k = mon1; k <= mon2; k++) {
			var y = Math.floor(k / 12);
			var m = k - (y * 12);
			var d = new Date(y, m, 1);

			eventdb.ensureCache(d.toString('yyyy-MM'));

			var d2 = DateUtilities.PositionFromDate(d);
			var x = Math.round(tc.getPositionFromTime(d2) + ppo);
			// console.log(d, d2, x);
			// var x = tc.getPositionFromTime(d2);
			var el2 = $('<div>');
			el2.addClass('bottommarker');
			el2.addClass('month');
			el2.css( {
				position : 'absolute',
				left : x + 'px'
			});
			var el3 = $('<div>');
			el3.addClass('label');
			el3.text(d.toString("MMM yyyy"));
			el2.append(el3);
			el3 = $('<div>');
			el3.addClass('line');
			el2.append(el3);
			el1.append(el2);
		}
		/*
		 * for ( var k = 0; k < 20; k++) { var d = k * 14; var x =
		 * tc.getPositionFromTime(d) - ppo; var el2 = $('<div>');
		 * el2.addClass('bottommarker'); el2.addClass('week'); el2.css( {
		 * position : 'absolute', left : x + 'px' }); var el3 = $('<div>');
		 * el3.addClass('label'); el3.text(d.toString()); el2.append(el3); el3 =
		 * $('<div>'); el3.addClass('line'); el2.append(el3); el1.append(el2); }
		 */
		timelineel.empty().append(el1);
		el1.addClass('innertimeline');

		// �ndra left + width på alla blocken också...
		for ( var k = 0; k < ep.countItems(); k++) {
			var item = ep.getItemByIndex(k);
			// console.log(item);
			if (item == null)
				continue;
			var el = $('#' + item.id);
			var lp = Math.round(tc.getPositionFromTime(item.left));
			var rp = Math.round(tc.getPositionFromTime(item.right));
			var wp = rp - lp;
			el.css( {
				left : lp + 'px',
				width : wp + 'px'
			});
		}

		var all = eventdb.getAll();
		for ( var i = 0; i < all.length; i++) {
			var event = all[i];
			var el = $('#' + event.id);
			repositionEventElement(el, event);
		}

	}
	positionpoints = function() {
		// if( Modernizr.touch ){
		var cc = tc.getTimeCenter();
		cursor_time = cc;
		// }
		var ppo = Math.round(tc.getDisplayOffset());
		var yo = 40 - Math.round(tc.getLineOffset());
		// console.log('pan: ppo=' + ppo + ', yo=' + yo);
		timelineel.css( {
			position : 'absolute',
			left : -ppo + 'px'
		});
		eventsel.css( {
			position : 'absolute',
			left : -ppo + 'px',
			top : yo + 'px'
		});
		var x = Math.round(tc.getPositionFromTime(today_time));
		todayel.css( {
			position : 'absolute',
			left : x + 'px'
		});
		x = Math.round(tc.getPositionFromTime(cursor_time));
		cursorel.css( {
			position : 'absolute',
			left : x + 'px'
		});
		return updatecursorlabel();
	}

	tc.addListener(function(e) {
		var forceregen = positionpoints();
		if (e.zoomed || forceregen)
			regeneratepoints();
	});
	ep.addListener(function(arg) {
		// console.log('animation event', arg);
			for ( var i = 0; i < arg.create.length; i++) {
				var id = arg.create[i];
				var item = eventdb.get(id);
				var item2 = ep.getItem(id);
				// console.log('create', id, item, item2);
				// var item = ep.getItem(event.clientid);
				$('#' + item.clientid).css( {
					height : '1px',
					top : (item2.line * 40) + 'px',
					opacity : 0
				});
				$('#' + item.clientid).animate( {
					height : '30px',
					opacity : 1
				}, 200, 'easeInOutQuart');
			}

			for ( var i = 0; i < arg.show.length; i++) {
				var id = arg.show[i];
				var item = eventdb.get(id);
				// console.log('show', id, item);
				$('#' + item.clientid).animate( {
					opacity : 1
				}, 200, 'easeInOutQuart');
			}

			for ( var i = 0; i < arg.hide.length; i++) {
				var id = arg.hide[i];
				var item = eventdb.get(id);
				// console.log('hide', id, item);
				$('#' + item.clientid).animate( {
					opacity : 0
				}, 200, 'easeInOutQuart');
			}

			for ( var i = 0; i < arg.move.length; i++) {
				var id = arg.move[i];
				var item = eventdb.get(id);
				var item2 = ep.getItem(id);
				// console.log('move', id, item, item2);
				// var item = ep.getItem(event.clientid);
				$('#' + item.clientid).animate( {
					top : (item2.line * 40) + 'px'
				}, 400, 'easeOutBounce');
			}
		});

	function showdetails(id) {
		// alert("show details for " + id);
		var el = $('#' + id);
		var id2 = el.attr('id2');
		// console.log('id2', id2);
		var event = eventdb.get(id2);
		// console.log('event', event);
		alert('clicked on \"' + event.title + '\" (' + event.id + ')\n\n'
				+ event.start + ' -> ' + event.end + ' ');
	}

	eventdb.addNewEventsListener(function(event) {
		var ld = Date.parseExact(event.start, "yyyy-MM-dd");
		var rd = Date.parseExact(event.end, "yyyy-MM-dd").addDays(1);
		var lt = DateUtilities.PositionFromDate(ld);
		var rt = DateUtilities.PositionFromDate(rd);

		var el = $('<div>');
		el.addClass('block');
		var id = 'x' + (counter++);
		el.attr('id', id);
		el.attr('id2', event.id);
		el.css( {
			top : '40px',
			height : '40px'
		});
		el.html('<div>' + event.title + '</div>');

		(function() {
			var id2 = id;
			if (Modernizr.touch) {
				el.bind("touchend", function() {
					if (!dragging)
						showdetails(id2);
				});
			} else {
				el.bind('mouseup', function() {
					if (!dragging)
						showdetails(id2);
				});
			}
		})();

		event.clientid = id;
		event.left = lt;
		event.right = rt;

		// console.log('created element', event, el);
			repositionEventElement(el, event);

			eventsel.append(el);

			ep.addItems( [ event ]);
		});

	positionpoints();
	regeneratepoints();
	tc.setTimeCenter(today_time, 40);

	$('#today').click(function() {
		tic.animateTo(today_time);
	});
	$('#sum2011').click(function() {
		tic.animateTo(1 * 10);
	});
	$('#win2011').click(function() {
		tic.animateTo(1 * 30);
	});
	$('#sum2012').click(function() {
		tic.animateTo(1 * 50);
	});

	$(outerel).bind("mousedown", function(e) {
		dragging = false;
	});
	$(outerel).bind("mousemove", function(e) {
		dragging = true;
	});
	if (Modernizr.touch) {
		$(outerel).bind("touchstart", function(e) {
			dragging = false;
		});
		$(outerel).bind("touchmove", function(e) {
			dragging = true;
		});
	}
	$('#addsome').click(function() {
		addsome();
	});
	$('#togglesome').click(function() {
		ep.filter(function(el) {
			return (Math.round(Math.random() * 2) == 1);
		});
	});
	$('#showall').click(function() {
		ep.filter(function(el) {
			return true;
		});
	});

	_lastdropdown = '';
	setDropdown = function(sel) {
		if (_lastdropdown != sel)
			_lastdropdown = sel;
		else
			_lastdropdown = '';
		$('div.dropdown').each(function() {
			var down = ($(this).attr('id') == _lastdropdown);
			// console.log(this, down);
				$(this).css( {
					display : 'block',
					top : down ? '0px' : '-' + $(this).height() + 'px'
				});
			});
		if (_lastdropdown != '')
			$('div#dimmer').css( {
				opacity : 0.6,
				display : 'block'
			});
		else {
			$('div#dimmer').css( {
				opacity : 0.0,
				display : 'none'
			});
		}
	}
	$('div#dimmer').click(function(e) {
		setDropdown('');
	});
	$('div.dropdown').click(function(e) {
		e.preventDefault();
	});
	setTimeout(function() {
		setDropdown('');
	}, 1000);
	$('#aboutbutton').click(function() {
		setDropdown('aboutdropdown');
	});
	$('#favouritebutton').click(function() {
		setDropdown('favouritesdropdown');
	});
	$('#tagbutton').click(function() {
		setDropdown('tagsdropdown');
	});
	if (Modernizr.touch) {
		$(document.body).bind("touchmove", function(e) {
			e.preventDefault();
		});
	}
	$(document.body).bind("mousedown", function(e) {
		e.preventDefault();
	});
	$(window).resize(function(e) {
		tc.setWidth(outerel.width());
	});
});
