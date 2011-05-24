ObservableTests = function() {
	module("Observable tests");

	test("Can add listeners", function() {
		var p = new Observable();
		var ml = new MockObserver();
		p.addListener(ml.listener);
		p.fire('test1');
		ok(ml.callcount == 1);
		ok(ml.lastarg == 'test1');
	});

	test("Calls multiple listeners", function() {
		var p = new Observable();
		var l1 = new MockObserver();
		var l2 = new MockObserver();
		p.addListener(l1.listener);
		p.addListener(l2.listener);
		p.fire('test1');
		ok(l1.callcount == 1);
		ok(l2.callcount == 1);
		ok(l1.lastarg == 'test1');
		ok(l2.lastarg == 'test1');
	});

};
