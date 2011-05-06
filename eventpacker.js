EventPacker = function() {

	var locals = {
		MAXLINES : 5,
		events : [],
		changelinecallbacks : [],
		_getItem : function(id) {
			for (k = 0; k < locals.events.length; k++)
				if (locals.events[k].id == id)
					return locals.events[k];
			return null;
		},
		_fireChange : function(arg) {
			$.each(locals.changelinecallbacks, function() {
				this.call(this, ret, arg);
			});
		},
		_addItem : function(item) {
			var test = locals._getItem(item.id);
			if (test != null)
				return false;
			item._new = true;
			item._dirty = true;
			if (typeof (item.hidden) == 'undefined')
				item.hidden = false;
			item._show = !item.hidden;
			item._hide = item.hidden;
			item.line = -1;
			locals.events.push(item);
			return true;
		},
		_weight : function(item) {
			var l = item.right - item.left;
			var s = item.left;
			return s - l / 2;
		},
		_collides : function(a, b) {

			if (a.right < b.left)
				return false;

			if (a.left > b.right)
				return false;

			return true;
		},
		_sortorder : function() {
			var data = [];
			$.each(locals.events, function() {
				data.push( {
					k : this.id,
					w : locals._weight(this)
				});
			});
			data.sort(function(a, b) {
				return a.w - b.w;
			});
			return data;
		},
		_pack : function() {
			// console.log('_pack called');
			var ord = locals._sortorder();
			var placed = [];
			$
					.each(ord, function() {
						var id = this.k;
						var item = locals._getItem(id);
						item.oldline = item.line;
						item.line = -1;
						// console.log('++ _each ord');
							// console.log('place ', id, item);
							var lowest = -1;
							for ( var line = 0; line < locals.MAXLINES
									&& lowest == -1; line++) {
								// console.log('trying to place ', id, ' at line
								// #',
								// line);
								var anycollisions = false;
								$.each(placed, function() {
									var pid = this.k;
									// console.log(pid);
										var p = locals._getItem(pid);
										if (p.line == line
												&& locals._collides(p, item)) {
											// console.log('collision between ',
										// p,
										// ' and ', item);
										anycollisions = true;
									}
								});
								if (!anycollisions) {
									// console.log('no collisions on line ',
									// line,
									// ', place ', id, ' there');
									lowest = line;
								}
							}
							// console.log('lowest line: ', lowest);
							// console.log('-- _each ord');
							if (lowest == -1)
								return;
							placed.push( {
								k : id
							});
							item.line = lowest;
							item._move = (item.line != item.oldline);
							// console.log('final line', item);
						});
			// console.log('_pack done');
		},
		_checkChanges : function() {
			locals._pack();

			var createlist = [];
			var showlist = [];
			var hidelist = [];
			var movelist = [];

			$.each(locals.events, function() {
				if (this._new)
					createlist.push(this.id);
				if (this._show)
					showlist.push(this.id);
				else if (this._hide)
					hidelist.push(this.id);
				else if (this._move)
					movelist.push(this.id);
			});

			if (movelist.length > 0 || showlist.length > 0
					|| hidelist.length > 0 || createlist.length > 0) {
				locals._fireChange( {
					create : createlist,
					show : showlist,
					hide : hidelist,
					move : movelist
				});
			}
			$.each(locals.events, function() {
				this._new = false;
				this._show = false;
				this._hide = false;
				this._move = false;
			});
		},
		_filter : function(visibilitycallback) {
			$.each(locals.events, function() {
				var nh = !visibilitycallback.call(this, this);
				if (nh == this.hidden)
					return;
				this.hidden = nh;
				this._show = !nh;
				this._hide = nh;
				this._dirty = true;
			});
			locals._checkChanges();
		}
	};

	var ret = {

		_locals : locals,

		addItem : function(item) {
			locals._addItem(item);
			locals._checkChanges();
		},
		addItems : function(list) {
			$.each(list, function() {
				locals._addItem(this);
			});
			locals._checkChanges();
		},
		getItem : function(id) {
			return locals._getItem(id);
		},
		filter : function(visibilitycallback) {
			locals._filter(visibilitycallback);
		},
		showItem : function(id) {
			var evt = locals._getItem(id);
			// if (!evt.hidden)
		// return;
		evt.hidden = false;
		locals._checkChanges();
	},
	hideItem : function(id) {
		var evt = locals._getItem(id);
		console.log(evt);
		// if (evt.hidden)
		// return;
		evt.hidden = true;
		console.log(evt);
		locals._checkChanges();
	},
	fireChange : function(arg) {
		locals._fireChange(arg);
	},
	addListener : function(cb) {
		locals.changelinecallbacks.push(cb);
	}
	};

	return ret;
}