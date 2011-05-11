EventPacker = function() {
	var obs = new Observable();
	var locals = {
		MAXLINES : 30,
		events : [],
		_getItem : function(id) {
			for ( var k = 0; k < locals.events.length; k++)
				if (locals.events[k].id == id)
					return locals.events[k];
			return null;
		},
		_fireChange : function(arg) {
			obs.call(arg);
		},
		_addItem : function(item) {
			var test = locals._getItem(item.id);
			if (test != null)
				return false;
			item._new = true;
			item._move = false;
			if (typeof (item["hidden"]) == 'undefined')
				item.hidden = false;
			item._show = !item.hidden;
			item._hide = false;// item.hidden;
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
				if (this.hidden)
					return;
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
			var ord = locals._sortorder();
			var placed = [];
			$.each(
					ord,
					function() {
						var id = this.k;
						var item = locals._getItem(id);
						item.oldline = item.line;
						// item.line = -1;
						var lowest = -1;
						for ( var line = 0; line < locals.MAXLINES
								&& lowest == -1; line++) {
							var anycollisions = false;
							$.each(placed,
									function() {
										var pid = this.k;
										var p = locals._getItem(pid);
										if (p.line == line
												&& locals._collides(p, item)) {
											anycollisions = true;
										}
									});
							if (!anycollisions) {
								lowest = line;
							}
						}
						if (lowest == -1)
							return;
						placed.push( {
							k : id
						});
						item.line = lowest;
						item._move = (item.line != item.oldline);
					});
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
				if (this._hide)
					hidelist.push(this.id);
				if (this._move)
					movelist.push(this.id);
			});

			if (movelist.length > 0 || showlist.length > 0
					|| hidelist.length > 0 || createlist.length > 0) {
				obs.fire( {
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
			if (!evt.hidden)
				return;
			evt.hidden = false;
			evt._show = true;
			locals._checkChanges();
		},
		hideItem : function(id) {
			var evt = locals._getItem(id);
			if (evt.hidden)
				return;
			evt.hidden = true;
			evt._hide = true;
			locals._checkChanges();
		},
		addListener : function(cb) {
			obs.addListener(cb);
		}
	};

	return ret;
}
