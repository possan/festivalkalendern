FingerIdHelperTests = function() {
	module("FingerIdHelper tests");
	test("can register first", function() {
		var h = new FingerIdHelper();
		var a1 = h.add('a');
		equals(a1, 1);
	});
	test("can find first", function() {
		var h = new FingerIdHelper();
		var a1 = h.add('a');
		var a2 = h.get('a');
		equals(a1, 1);
		equals(a2, 1);
	});
	test("cant find unknown", function() {
		var h = new FingerIdHelper();
		var a1 = h.get('x')
		equals(a1, -1);
	});
	test("can find second", function() {
		var h = new FingerIdHelper();
		var a1 = h.add('a');
		var a2 = h.get('a');
		var b1 = h.add('b');
		var b2 = h.get('b');
		equals(a1, 1);
		equals(a2, 1);
		equals(b1, 2);
		equals(b2, 2);
	});
	test("can remove first and second keeps id", function() {
		var h = new FingerIdHelper();
		h.add('a');
		h.add('b');
		var a1 = h.get('a');
		var b1 = h.get('b');
		equals(a1, 1);
		equals(b1, 2);
		h.remove('a');
		var a2 = h.get('a');
		var b2 = h.get('b');
		equals(a2, -1);
		equals(b2, 2);
	});
	test("can remove second with two", function() {
		var h = new FingerIdHelper();
	});
	test("can add a lot", function() {
		var h = new FingerIdHelper();
	});
	test("chord create and remove test 1", function() {
		var h = new FingerIdHelper();
		h.add('a');
		h.add('b');
		h.remove('a');
		var a = h.get('a');
		equals(a, -1, 'a should not be found');
		var c = h.add('c');
		equals(c, 3);
	});
	test("chord clear test 1", function() {
		var h = new FingerIdHelper();
		h.add('a');
		h.add('b');
		h.remove('a');
		var a1 = h.add('a');
		equals(a1, 3);
		h.remove('b');
		h.remove('a');
		var a2 = h.add('a');
		equals(a2, 1);
	});
};

PanZoomHelperTests = function() {
	var h = new PanZoomHelper();
	module("PanZoomHelper tests");
	test("calcSpan test 1", function() {
		var i = {
			l : 40,
			r : 100
		};
		var o = h.calcSpan(i);
		equals(o, 60);
	});
	test("calcSpan test 2", function() {
		var i = {
			l : 100,
			r : 60
		};
		var o = h.calcSpan(i);
		equals(o, 40);
	});
	test("calcCenter test 1", function() {
		var i = {};
		i.l = 30;
		i.r = 50;
		var o = h.calcCenter(i);
		equals(o, 40);
	});
	test("calcRadius test 2", function() {
		var i = {};
		i.l = 30;
		i.r = 50;
		var o = h.calcRadius(i);
		equals(o, 10);
	});
	test("calcZoom test 1", function() {
		var i = {
			o : {
				l : 25,
				r : 75
			},
			n : {
				l : 0,
				r : 100
			}
		};
		var o = h.calcZoom(i);
		equals(o, 200);
	});
	test("calcZoom test 2", function() {
		var i = {
			o : {
				l : 50,
				r : 100
			},
			n : {
				l : 0,
				r : 50
			}
		};
		var o = h.calcZoom(i);
		equals(o, 100);
	});
	test("calcZoom test 3", function() {
		var i = {
			o : {
				l : 50,
				r : 100
			},
			n : {
				l : 20,
				r : 25
			}
		};
		var o = h.calcZoom(i);
		equals(o, 10);
	});
	test("calcPan test 1", function() {
		var i = {
			o : {
				l : 0,
				r : 10
			},
			n : {
				l : 90,
				r : 100
			}
		};
		var o = h.calcPan(i);
		equals(o, 90);
	});
	test("calcPan test 2", function() {
		var i = {
			o : {
				l : 50,
				r : 100
			},
			n : {
				l : 0,
				r : 50
			}
		};
		var o = h.calcPan(i);
		equals(o, -50);
	});
	test("calcTimeInRange test 1", function() {
		var o = h.calcTimeInRange(0, 30, 40);
		equals(o, 30);
	});
	test("calcTimeInRange test 2", function() {
		var o = h.calcTimeInRange(50, 60, 140);
		equals(o, 100);
	});
	test("calcTimeInRange test 3", function() {
		var o = h.calcTimeInRange(110, 55, 90);
		equals(o, 90);
	});
	test("calcNewTimesFromPanZoom test 1", function() {
		var i = {
			t1 : 0,
			t2 : 100,
			p : 0,
			z : 100
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, 0);
		equals(o.t2, 100);
	});
	test("calcNewTimesFromPanZoom test 2", function() {
		var i = {
			t1 : 0,
			t2 : 100,
			p : 50,
			z : 100
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, -50);
		equals(o.t2, 50);
	});
	test("calcNewTimesFromPanZoom test 3", function() {
		var i = {
			t1 : 0,
			t2 : 100,
			p : 100,
			z : 100
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, -100);
		equals(o.t2, 0);
	});
	test("calcNewTimesFromPanZoom test 4", function() {
		var i = {
			t1 : 0,
			t2 : 100,
			p : 0,
			z : 50
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, -50);
		equals(o.t2, 150);
	});
	test("calcNewTimesFromPanZoom test 5", function() {
		var i = {
			t1 : 0,
			t2 : 100,
			p : 0,
			z : 200
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, 25);
		equals(o.t2, 75);
	});
	test("calcNewTimesFromPanZoom test 6", function() {
		var i = {
			t1 : 50,
			t2 : 100,
			p : -100,
			z : 100
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, 100);
		equals(o.t2, 150);
	});
	test("calcNewTimesFromPanZoom test 7", function() {
		var i = {
			t1 : 50,
			t2 : 100,
			p : 100,
			z : 50
		}
		var o = h.calcNewTimesFromPanZoom(i);
		equals(o.t1, -25);
		equals(o.t2, 75);
	});
	test("calcNewTimes test 1", function() {
		var i = {
			t1 : 50,
			t2 : 100,
			o : {
				l : 0,
				r : 100
			},
			n : {
				l : 0,
				r : 100
			}
		}
		var o = h.calcNewTimes(i);
		equals(o.t1, 50);
		equals(o.t2, 100);
	});
	test("calcNewTimes test 2", function() {
		var i = {
			t1 : 100,
			t2 : 200,
			o : {
				l : 0,
				r : 100
			},
			n : {
				l : 25,
				r : 75
			}
		}
		var o = h.calcNewTimes(i);
		equals(o.t1, 50);
		equals(o.t2, 250);
	});
	test("calcNewTimes test 3", function() {
		var i = {
			t1 : 100,
			t2 : 200,
			o : {
				l : 0,
				r : 50
			},
			n : {
				l : 50,
				r : 100
			}
		}
		var o = h.calcNewTimes(i);
		equals(o.t1, 50);
		equals(o.t2, 150);
	});
	test("calcNewTimes test 4", function() {
		var i = {
			t1 : 100,
			t2 : 200,
			o : {
				l : 50,
				r : 100
			},
			n : {
				l : 0,
				r : 50
			}
		}
		var o = h.calcNewTimes(i);
		equals(o.t1, 150);
		equals(o.t2, 250);
	});
	test("calcNewTimes test 5", function() {
		var i = {
			t1 : 100,
			t2 : 200,
			o : {
				l : 25,
				r : 75
			},
			n : {
				l : 0,
				r : 100
			}
		}
		var o = h.calcNewTimes(i);
		equals(o.t1, 125);
		equals(o.t2, 175);
	});
};

DateUtilitiesTests = function() {
	module("Date utilities tests");
	test("can convert from date to position and back 1", function() {
		var p = DateUtilities.PositionFromDate(new Date(2011, 5, 22));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2011-06-22");
	});
	test("can convert from date to position and back 2", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 0, 1));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-01-01");
	});
	test("can convert from date to position and back 3", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 1, 1));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-02-01");
	});
	test("can convert from date to position and back 4", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 5, 1));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-06-01");
	});
	test("can convert from date to position and back 5", function() {
		var p = DateUtilities.PositionFromDate(new Date(2011, 0, 1));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2011-01-01");
	});
	test("can convert from date to position and back 6", function() {
		var p = DateUtilities.PositionFromDate(new Date(2009, 0, 1));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2009-01-01");
	});
	test("can convert from date to position and back 7", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 0, 5));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-01-05");
	});
	test("can convert from date to position and back 8", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 0, 10));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-01-10");
	});
	test("can convert from date to position and back 9", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 0, 15));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-01-15");
	});
	test("can convert from date to position and back 10", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 1, 1));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-02-01");
	});
	test("can convert from date to position and back 11", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 1, 15));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-02-15");
	});
	test("can convert from date to position and back 12", function() {
		var p = DateUtilities.PositionFromDate(new Date(2010, 1, 25));
		var d = DateUtilities.DateFromPosition(p);
		equals(d.toString("yyyy-MM-dd"), "2010-02-25");
	});
};