(function(target) {

	EventDB = function(linkformat) {

		var p = {
			linkformat : linkformat,
			ymcache : [],
			allevents : [],
			cache : new AsyncCache(),
			neweventobserver : new Observable()
		};

		p.cache.addProvider(function(cache, key) {
			// console.log('EventDB: try to get from cache:', cache, key);
				var u = linkformat.replace('{0}', key);
				$.getJSON(u, function(data) {
					cache.set(data.date, data.events);
				});
			});

		this["ensureCache"] = function(monthtag) {
			p.cache.get(monthtag, function(events) {
				for ( var k = 0; k < events.length; k++) {
					var event = events[k];
					var dupe = false;
					for ( var i = 0; i < p.allevents.length; i++) {
						if (p.allevents[i].id == event.id)
							dupe = true;
					}
					if (dupe)
						continue;
					// console.log('EventDB: got new event', event.title,
					// event.id, event);
					p.allevents.push(event);
					p.neweventobserver.fire(event);
				}
			});
		}

		this["addNewEventsListener"] = function(l) {
			p.neweventobserver.addListener(l);
		}

		this["getAll"] = function() {
			return p.allevents;
		}

		this["get"] = function(id) {
			for ( var i = 0; i < p.allevents.length; i++)
				if (p.allevents[i].id == id)
					return p.allevents[i];
			return undefined;
		}
	};

	target["EventDB"] = EventDB;

})(window);