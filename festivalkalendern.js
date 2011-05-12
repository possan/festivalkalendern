$(document).ready( function() {

	var outerel = $('#timeline');
	var timelineel = $('.innertimeline',outerel);
	var eventsel = $('.events',outerel);
	var cursorel = $('.cursor',outerel);
	var todayel = $('.today',outerel);

	var today_time = 50;
	var cursor_time = today_time+10;

	var tc = new TimelineController();
	var tic = new TimelineInputController(outerel, tc);
	var ep = new EventPacker();

	updatecursorlabel = function() {
		var cc = tc.getTimeCenter();
		$('.label',cursorel).text("MÅ, 3 FEB "+cc);
	}
	regeneratepoints = function() {

		var el1 = $('<div>');
		var ppo = tc.getDisplayOffset();
		// console.log('scale: ppo='+ppo);
		for (var k = 0; k < 50; k++) {
			var d = k * 10;
			var x = tc.getPositionFromTime(d) - ppo;
			var el2 = $('<div>');
			el2.addClass('week');
			el2.text(d.toString());
			el2.css({
				position: 'absolute',
				left: x + 'px'
			});
			el1.append(el2);
		}

		for (var k = 0; k < 20; k++) {
			var d = k * 14;
			var x = tc.getPositionFromTime(d) - ppo;
			var el2 = $('<div>');
			el2.addClass('month');
			el2.text(d.toString());
			el2.css({
				position: 'absolute',
				left: x + 'px'
			});
			el1.append(el2);
		}

		el1.append($('<div>').css({
			position:'absolute',
			left:'10px',
			top:'50px',
			width:'400px'
		}).text('offset '+tc.getTimeOffset()+' span '+tc.getTimeSpan()));

		timelineel.empty().append(el1);
		el1.addClass('innertimeline');

		// ändra left + width på alla blocken också...
		for( var k=0; k<ep.countItems(); k++ ) {
			var item = ep.getItemByIndex(k);
			console.log(item);
			if( item == null )
				continue;
			var el = $('#'+item.id);
			var lp = Math.round(tc.getPositionFromTime( item.left ));
			var rp = Math.round(tc.getPositionFromTime( item.right ));
			var wp = rp - lp;
			el.css({
				left: lp + 'px',
				width: wp + 'px'
			} );
		}
	}
	positionpoints = function() {
		//if( Modernizr.touch ){
		var cc = tc.getTimeCenter();
		cursor_time = cc;
		//}
		var ppo = Math.round(tc.getDisplayOffset());
		// console.log('pan: ppo='+ppo);
		timelineel.css({
			position: 'absolute',
			left: -ppo + 'px'
		});
		eventsel.css({
			position: 'absolute',
			left: -ppo + 'px'
		});
		var x = Math.round(tc.getPositionFromTime(today_time));
		todayel.css({
			position: 'absolute',
			left: x + 'px'
		});
		x =Math.round( tc.getPositionFromTime(cursor_time));
		cursorel.css({
			position: 'absolute',
			left: x + 'px'
		});
		updatecursorlabel();
	}
	tc.addListener( function(e) {
		positionpoints();
		if (e.zoomed)
			regeneratepoints();
	});
	ep.addListener( function(arg) {
		//console.log(arg);
		for (var i = 0; i < arg.create.length; i++) {
			var domid = arg.create[i];
			var item = ep.getItem(domid);
			// console.log(item);
			$('#' + domid).css({
				height: '1px',
				top: (item.line * 40) + 'px',
				opacity: 0
			});
			$('#' + domid).animate({
				height: '30px',
				opacity: 1
			}, 200, 'easeInOutQuart');
		}

		for (var i = 0; i < arg.show.length; i++) {
			var domid = arg.show[i];
			var item = ep.getItem(domid);
			$('#' + domid).animate({
				opacity: 1
			}, 200, 'easeInOutQuart');
		}

		for (var i = 0; i < arg.hide.length; i++) {
			var domid = arg.hide[i];
			var item = ep.getItem(domid);
			$('#' + domid).animate({
				opacity: 0
			}, 200, 'easeInOutQuart');
		}

		for (var i = 0; i < arg.move.length; i++) {
			var domid = arg.move[i];
			var item = ep.getItem(domid);
			$('#' + domid).animate({
				top: (item.line * 40) + 'px'
			}, 400, 'easeOutBounce');
		}
	});
	function clickevent(e) {
		var el = $(e.target).parent('div.block');
		var id = el.attr('id');
		console.log("click target",id);
	}

	function addsome() {
		var newitems = [];
		var n = 1 + Math.round(Math.random() * 4);
		for (var i = 0; i < n; i++) {
			var lt = 2 + Math.round(Math.random() * 40) * 4;
			var wt = 3 + Math.round(Math.random() * 40) * 4;
			var rt = lt + wt;
			var lp = Math.round(tc.getPositionFromTime( lt ));
			var rp = Math.round( tc.getPositionFromTime( rt ));
			var wp = rp - lp;
			var el = $('<div>');
			el.addClass( 'block');
			var id = 'x' + counter;
			el.attr('id', id);
			el.css({
				left: lp + 'px',
				width: wp + 'px',
				top: '40px'
			} );
			el.html( '<span>Some text</span>' );
			el.click(clickevent);
			eventsel.append(el);
			newitems.push({
				id: id,
				left: lt,
				right: rt,
				customdata: counter
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

	//tc.setTimeSpan(100);
	//tc.setTimeOffset(0);
	tc.setTimeCenter(50, 50);

	positionpoints();
	regeneratepoints();

	$('#today').click( function() {
		tic.animateTo(1 * 40);
	});
	$('#sum2011').click( function() {
		tic.animateTo(1 * 10);
	});
	$('#win2011').click( function() {
		tic.animateTo(1 * 30);
	});
	$('#sum2012').click( function() {
		tic.animateTo(1 * 50);
	});
	/*
	 $('#zoomin').click( function() {
	 tc.setZoom(tc.getZoom() * 2);
	 });
	 $('#zoomout').click( function() {
	 tc.setZoom(tc.getZoom() / 2);
	 });*/

	$(outerel).bind("mousemove", function(e) {
		// if( Modernizr.touch )
		// return;
		// cursor_time = tc.getTimeFromPosition(e.pageX);
		// positionpoints();
	});
	$('#addsome').click( function() {
		addsome();
	});
	$('#togglesome').click( function() {
		ep.filter( function(el) {
			return (Math.round(Math.random() * 2) == 1);
		});
	});
	$('#showall').click( function() {
		ep.filter( function(el) {
			return true;
		});
	});
	$('#toggletagwindow').click( function() {
		if(
		$('.tagwindow').css('top') == '0px' )
			$('.tagwindow').css({
				top:'-250px'
			});
		else
			$('.tagwindow').css({
				top:'0px'
			});
	});
	$(document.body).bind("touchmove", function(e) {
		e.preventDefault();
	});
	$(document.body).bind("mousedown", function(e) {
		e.preventDefault();
	});
	$(window).resize( function(e) {
		tc.setWidth(outerel.width());
	});
});