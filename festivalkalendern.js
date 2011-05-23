$(document).ready(function() {

	var outerel = $('#timeline');
	var timelineel = $('.innertimeline', outerel);
	var eventsel = $('.events', outerel);
	var cursorel = $('.cursor', outerel);
	var todayel = $('.today', outerel);

	var today_time = 50;
	var cursor_time = today_time + 10;

	var tc = new TimelineController();
	var tic = new TimelineInputController(outerel, tc);
	var ep = new EventPacker();

	updatecursorlabel = function() {
		var cc = tc.getTimeCenter();
		$('.label', cursorel).html("M&Aring;, 3 FEB " + cc);
	}
	regeneratepoints = function() {

		var el1 = $('<div>');
		var ppo = tc.getDisplayOffset();
		// console.log('scale: ppo='+ppo);
		for ( var k = 0; k < 50; k++) {
			var d = k * 10;
			var x = tc.getPositionFromTime(d) - ppo;
			var el2 = $('<div>');
			el2.addClass('bottommarker');
			el2.addClass('month');
			el2.css( {
				position : 'absolute',
				left : x + 'px'
			});
			var el3 = $('<div>');
			el3.addClass('label');
			el3.text(d.toString());
			el2.append(el3);
			el3 = $('<div>');
			el3.addClass('line');
			el2.append(el3);
			el1.append(el2);
		}

		for ( var k = 0; k < 20; k++) {
			var d = k * 14;
			var x = tc.getPositionFromTime(d) - ppo;
			var el2 = $('<div>');
			el2.addClass('bottommarker');
			el2.addClass('week');
			el2.css( {
				position : 'absolute',
				left : x + 'px'
			});
			var el3 = $('<div>');
			el3.addClass('label');
			el3.text(d.toString());
			el2.append(el3);
			el3 = $('<div>');
			el3.addClass('line');
			el2.append(el3);
			el1.append(el2);
		}

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
	}
	positionpoints = function() {
		// if( Modernizr.touch ){
		var cc = tc.getTimeCenter();
		cursor_time = cc;
		// }
		var ppo = Math.round(tc.getDisplayOffset());
		var yo = 40 - Math.round(tc.getLineOffset());
		// console.log('pan: ppo='+ppo);
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
		updatecursorlabel();
	}
	tc.addListener(function(e) {
		positionpoints();
		if (e.zoomed)
			regeneratepoints();
	});
	ep.addListener(function(arg) {
		for ( var i = 0; i < arg.create.length; i++) {
			var domid = arg.create[i];
			var item = ep.getItem(domid);
			$('#' + domid).css( {
				height : '1px',
				top : (item.line * 40) + 'px',
				opacity : 0
			});
			$('#' + domid).animate( {
				height : '30px',
				opacity : 1
			}, 200, 'easeInOutQuart');
		}

		for ( var i = 0; i < arg.show.length; i++) {
			var domid = arg.show[i];
			var item = ep.getItem(domid);
			$('#' + domid).animate( {
				opacity : 1
			}, 200, 'easeInOutQuart');
		}

		for ( var i = 0; i < arg.hide.length; i++) {
			var domid = arg.hide[i];
			var item = ep.getItem(domid);
			$('#' + domid).animate( {
				opacity : 0
			}, 200, 'easeInOutQuart');
		}

		for ( var i = 0; i < arg.move.length; i++) {
			var domid = arg.move[i];
			var item = ep.getItem(domid);
			$('#' + domid).animate( {
				top : (item.line * 40) + 'px'
			}, 400, 'easeOutBounce');
		}
	});

	function showdetails(id) {
		alert("show details for " + id);
	}

	var dragging = false;
	var dragtimer = -1;

	function addsome() {
		var newitems = [];
		var n = 1 + Math.round(Math.random() * 4);
		for ( var i = 0; i < n; i++) {
			var lt = 2 + Math.round(Math.random() * 40) * 4;
			var wt = 3 + Math.round(Math.random() * 40) * 4;
			var rt = lt + wt;
			var lp = Math.round(tc.getPositionFromTime(lt));
			var rp = Math.round(tc.getPositionFromTime(rt));
			var wp = rp - lp;
			var el = $('<div>');
			el.addClass('block');
			var id = 'x' + counter;
			el.attr('id', id);
			el.css( {
				left : lp + 'px',
				width : wp + 'px',
				top : '40px'
			});
			el.html('<div>#' + id + '</div>');
			if (Modernizr.touch) {
				el.bind("touchend", function() {
					if (!dragging)
						showdetails(id);
				});
			} else {
				el.bind('mouseup', function() {
					if (!dragging)
						showdetails(id);
				});
			}
			eventsel.append(el);
			newitems.push( {
				id : id,
				left : lt,
				right : rt,
				customdata : counter
			});
			counter++;
		}
		ep.addItems(newitems);

	}

	var allitems = [];
	var counter = 0;

	addsome();
	addsome();
	addsome();
	addsome();

	tc.setTimeCenter(50, 50);

	positionpoints();
	regeneratepoints();

	$('#today').click(function() {
		tic.animateTo(1 * 40);
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