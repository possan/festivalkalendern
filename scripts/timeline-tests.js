TimelineTests = function() {
	module("Timeline tests")

	test("Span test", function() {
		var t = new TimelineController();
		t.setWidth(200);
		t.setTimeSpan(100);
		t.setTimeOffset(0);
		equals(t.getTimeFromPosition(0), 0);
		equals(t.getTimeFromPosition(100), 50);
		equals(t.getTimeFromPosition(200), 100);
	});
	test("Span test 2", function() {
		var t = new TimelineController();
		t.setWidth(200);
		t.setTimeSpan(100);
		t.setTimeOffset(50);
		equals(t.getPositionFromTime(0), -100);
		equals(t.getPositionFromTime(50), 0);
		equals(t.getPositionFromTime(100), 100);
	});
	test("Fires events on zoom", function() {
		var t = new TimelineController();
		t.setWidth(200);
		t.setTimeSpan(100);
		t.setTimeOffset(50);
		var l1 = new MockObserver();
		t.addListener(l1.listener);
		t.setTimeSpan(200);
		equals(l1.callcount, 1);
		equals(l1.lastarg.panning, false);
		equals(l1.lastarg.zoomed, true);
	});
	test("setTimeCenter test 1", function() {
		var t = new TimelineController();
		t.setWidth(150);
		t.setTimeCenter(0,33);
		equals(	t.getPositionFromTime(-33),0);
		equals(	t.getPositionFromTime(0),75);
		equals(	t.getPositionFromTime(33),150);
	});
	test("setTimeCenter test 2", function() {
		var t = new TimelineController();
		t.setTimeCenter(40,10);
		equals(	t.getTimeSpan(), 20);
		equals(	t.getTimeOffset(), 30);
	});
};