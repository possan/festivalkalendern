EventPackerTests = function() {
	module("EventPacker Tests");

	var MockListener = function() {
		var locals = {
			lastarg : '',
			callcount : 0
		}
		locals.listener = function(packer, arg) {
			locals.lastarg = arg;
			locals.callcount++;
		};
		return locals;
	};

	test("fire calls callbacks", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addListener(ml.listener);
		p.fireChange('test1');
		ok(ml.callcount == 1);
		ok(ml.lastarg == 'test1');
	});

	test("add event fires callback", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addListener(ml.listener);
		ok(ml.callcount == 0);
		p.addItems( [ {
			id : 'a',
			left : 7,
			right : 10
		}, {
			id : 'b',
			left : 5,
			right : 8
		} ]);
		ok(ml.callcount == 1);
		ok(ml.lastarg.create[0] == 'a');
		ok(ml.lastarg.create[1] == 'b');
		ok(ml.lastarg.create.length == 2);
		ok(ml.lastarg.show[0] == 'a');
		ok(ml.lastarg.show[1] == 'b');
		ok(ml.lastarg.show.length == 2);
		ok(ml.lastarg.hide.length == 0);
		ok(ml.lastarg.move.length == 0);
	});

	test("filter show and calls callback", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addListener(ml.listener);
		p.addItems( [ {
			id : 'a',
			left : 7,
			hidden : true,
			right : 10
		}, {
			id : 'b',
			left : 5,
			hidden : true,
			right : 8
		} ]);
		ok(p.getItem('a').hidden == true);
		ok(p.getItem('b').hidden == true);
		p.filter(function(item) {
			return (item.id == 'a');
		});
		ok(ml.callcount == 2, "Call count");
		ok(p.getItem('a').hidden == false, 'a is not hidden');
		ok(p.getItem('b').hidden == true, 'b is hidden');
		ok(ml.lastarg.show[0] == 'a', "Call argument");
		ok(ml.lastarg.show.length == 1, "Call argument");
		p.filter(function(item) {
			return (item.id == 'b');
		});
		ok(ml.callcount == 3, "Call count");
		ok(p.getItem('a').hidden == true, 'a is not hidden');
		ok(p.getItem('b').hidden == false, 'b is hidden');
		ok(ml.lastarg.show[0] == 'b', "Call argument");
		ok(ml.lastarg.show.length == 1, "Call argument");
		ok(ml.lastarg.hide[0] == 'a', "Call argument");
		ok(ml.lastarg.hide.length == 1, "Call argument");
	});

	test("can pack events 1", function() {
		var p = new EventPacker();
		p.addItems( [ {
			id : 'a',
			left : 7,
			hidden : false,
			right : 10
		}, {
			id : 'b',
			left : 5,
			hidden : true,
			right : 8
		}, {
			id : 'c',
			left : 5,
			hidden : false,
			right : 10
		} ]);
		ok(p.getItem('a').line == 2);
		ok(p.getItem('b').line == 1);
		ok(p.getItem('c').line == 0);
	});

	test("can weight individual items", function() {
		var p = new EventPacker();
		var w1 = p._locals._weight( {
			left : 2,
			right : 10
		});
		var w2 = p._locals._weight( {
			left : 5,
			right : 8
		});
		var w3 = p._locals._weight( {
			left : 5,
			right : 8
		});
		var w4 = p._locals._weight( {
			left : 6,
			right : 7
		});
		ok(w1 < w2);
		ok(w2 == w3);
		ok(w1 < w4);
		ok(w3 < w4);
	});

	test("can find collision 1", function() {
		var p = new EventPacker();
		ok(p._locals._collides( {
			left : 1,
			right : 2
		}, {
			left : 3,
			right : 4
		}) == false);
	});

	test("can find collision 2", function() {
		var p = new EventPacker();
		ok(p._locals._collides( {
			left : 0,
			right : 2
		}, {
			left : 1,
			right : 3
		}) == true);
	});

	test("can find collision 3", function() {
		var p = new EventPacker();
		ok(p._locals._collides( {
			left : 1,
			right : 3
		}, {
			left : 0,
			right : 2
		}) == true);
	});

	test("can find collision 4", function() {
		var p = new EventPacker();
		ok(p._locals._collides( {
			left : 0,
			right : 5
		}, {
			left : 1,
			right : 3
		}) == true);
	});

	test("can find collision 5", function() {
		var p = new EventPacker();
		ok(p._locals._collides( {
			left : 1,
			right : 3
		}, {
			left : 0,
			right : 4
		}) == true);
	});

	test("can sort based on weight", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addItems( [ {
			id : 'a',
			left : 7,
			right : 10
		}, {
			id : 'b',
			left : 5,
			right : 8
		}, {
			id : 'c',
			left : 5,
			right : 10
		} ]);
		var o = p._locals._sortorder();
		ok(o[0], 'c');
		ok(o[1], 'a');
		ok(o[2], 'b');
		ok(o.length, 3);
	});

	test("can sort events 1", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addItems( [ {
			id : 'c',
			left : 5,
			right : 10
		}, {
			id : 'd',
			left : 0,
			right : 15
		} ]);
		ok(p.getItem('c').line == 1);
		ok(p.getItem('d').line == 0);
	});

	test("can sort events 2", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addItems( [ {
			id : 'a',
			left : 7,
			right : 10
		}, {
			id : 'b',
			left : 5,
			right : 8
		}, {
			id : 'c',
			left : 5,
			right : 10
		}, {
			id : 'd',
			left : 0,
			right : 15
		} ]);
		ok(p.getItem('d').line == 0);
		ok(p.getItem('c').line == 1);
		ok(p.getItem('b').line == 2);
		ok(p.getItem('a').line == 3);
	});

	test("fires on change", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addItems( [ {
			id : 'a',
			left : 7,
			right : 10
		}, {
			id : 'b',
			left : 5,
			right : 8
		}, {
			id : 'c',
			left : 5,
			right : 10
		} ]);
		p.addListener(ml.listener);
		p.addItems( [ {
			id : 'd',
			left : 1,
			right : 15
		} ]);
		ok(ml.callcount == 1);
		ok(ml.lastarg.create[0] == 'd');
		ok(ml.lastarg.create.length == 1);
		ok(ml.lastarg.show[0] == 'd');
		ok(ml.lastarg.show.length == 1);
		ok(p.getItem('d').line == 0);
		ok(p.getItem('c').line == 1);
		ok(p.getItem('b').line == 2);
		ok(p.getItem('a').line == 3);
		ok(ml.lastarg.move[0] == 'a');
		ok(ml.lastarg.move[1] == 'b');
		ok(ml.lastarg.move[2] == 'c');
		ok(ml.lastarg.move.length == 3);
	});

	test("can hide item", function() {
		var p = new EventPacker();
		p.addItems( [ {
			id : 'a',
			left : 7,
			right : 10
		} ]);
		ok(p.getItem('a').hidden == false);
		p.hideItem('a');
		ok(p.getItem('a').hidden == true);
		p.hideItem('a');
		ok(p.getItem('a').hidden == true);
	});

	test("can show item", function() {
		var p = new EventPacker();
		p.addItems( [ {
			id : 'a',
			left : 7,
			hidden : true,
			right : 10
		} ]);
		equals(p.getItem('a').hidden, true);
		p.showItem('a');
		ok(p.getItem('a').hidden == false);
		p.showItem('a');
		ok(p.getItem('a').hidden == false);
	});

	test("fires hide event on hide", function() {
		var p = new EventPacker();
		var ml = new MockListener();
		p.addListener(ml.listener);
		p.addItems( [ {
			id : 'b',
			left : 5,
			right : 8
		}, {
			id : 'c',
			left : 6,
			right : 10
		} ]);
		equals(ml.callcount, 1, "call counter");
		p.hideItem('b');
		equals(ml.callcount, 2, "call counter");
		equals(ml.lastarg.hide[0], 'b', "hide item 1");
		equals(ml.lastarg.hide.length, 1, "hide item count");
		p.hideItem('c');
		equals(ml.callcount, 3, "call counter");
		equals(ml.lastarg.hide[0], 'c', "hide item 1");
		equals(ml.lastarg.hide.length, 1, "hide item count");
		p.hideItem('b');
		equals(ml.callcount, 4, "call counter");
		equals(ml.lastarg.hide.length, 0, "hide item count");
	});

}
