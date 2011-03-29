var currentmonth = 'xxxx-xx';
var currenttags = [];
var currentlayer = -1;

function debug(x){
if( console )
	if( console.log )
		console.log(x);
}
 
var tagcache = {
    "lastupdate": "timestamp",
    "tags": [{
        "tag": "a",
        "count": 2,
        "weight": 1.00,
        "size": 1.00
    }, {
        "tag": "b",
        "count": 1,
        "weight": 0.5,
        "size": 0.00
    }, {
        "tag": "c",
        "count": 1,
        "weight": 0.5,
        "size": 0.00
    }]
};

var monthcache = {
    "2011-02": {
        "lastupdate": "timestamp",
        "items": [{
            "from": "2011-01-29",
            "to": "2012-02-10",
            "title": "XYZ 1",
            "link": "link1",
            "tags": ["a", "b"]
        }, {
            "from": "2011-02-15",
            "to": "2012-02-20",
            "title": "XYZ 2",
            "link": "link2",
            "tags": ["a", "c"]
        }]
    }
};
 
function loadmonthdata(month, callback){
    debug('loadmonthdata', month);
    $.ajax({
        url: 'http://festivalkalendern.project.possan.se/db.php?date=' + month,
        success: function(data){
    	debug('in ajax callback', data);
            var jd = $.parseJSON(data); 
            monthcache[month] = jd;
            if (callback == null) 
                return;
            callback(month);
        }
    });
}

function loadtagdata(callback){
	debug('loadtagdata');
    setTimeout(function(){
    	debug('calling callback');
        if (callback == null) 
            return;
        callback(tagcache);
    }, 1000);
}

function refreshdatecache(datetag, callback){
    if (typeof monthcache[datetag] != 'undefined') 
        return;
    loadmonthdata(datetag, callback);
}

function refreshtagcache(callback){
    if (tagcache.tags.length > 0) 
        return;
    loadtagdata(callback);
} 

function buildmonthlayout(tag){

    var date = Date.parseExact(tag, "yyyy-MM");
    debug("date", date);
    
    var data = {
        datetag: tag,
        date: date,
        year: date.toString("yyyy"),
        month: date.toString("MM"),
        columns: 7,
        rows: 0,
        weeks: [],
        cells: []
    };
    
    datefirst = new Date(date);
    datelast = new Date(date).moveToLastDayOfMonth();
    firstweek = datefirst.getWeekOfYear();
    lastweek = datelast.getWeekOfYear();
    var c = 0;
    var r = 0;
    var weekdata = {};
    var lastweek = -1;
    for (var d = 1; d <= date.getDaysInMonth(); d++) {
        var testdate = new Date(date).set({
            day: d
        });
        var testweek = testdate.getWeekOfYear();
        // console.log('testweek: ' + testweek);
        if (testweek != lastweek) {
            // console.log('new week: ' + testweek);
            if (lastweek != -1) 
                data.weeks.push(weekdata);
            lastweek = testweek;
            weekdata = {
                number: testweek,
                date: testdate,
                cells: []
            };
            r++;
        }
        c = testdate.getDay();
        var cell = {
            row: r,
            column: c,
            date: testdate,
            week: testweek,
        };
        data.cells.push(cell);
        weekdata.cells.push(cell);
        // console.log('day ' + d + ':', testdate, 'column:', c,
		// 'row:', r);
    };
    data.weeks.push(weekdata);
    debug(data);
    return data;
}

function rendermonth(target, date){
    var layout = buildmonthlayout(date);
    var data = { events: [] };
    if( typeof(monthcache[date]) != 'undefined' )	
    	data = monthcache[date];
    debug(data);
    var rootel = document.createElement('div');
    rootel.className = 'month';
    
    var topel = document.createElement('div');
    topel.className = 'top';
    rootel.appendChild(topel);
    {
	    var prevbutton = document.createElement('a');
	    prevbutton.className = 'previous';
	    prevbutton.appendChild(document.createTextNode('<< previous'));
	    $(prevbutton).click(function(){
	        prevmonth();
	    });
	    topel.appendChild(prevbutton);
	    
	    topel.appendChild(document.createTextNode(' '));
	    
	    var titleel = document.createElement('span');
	    titleel.className = 'title';
	    titleel.appendChild(document.createTextNode(layout.date.toString("MMMM, yyyy")));
	    topel.appendChild(titleel);
	    
	    topel.appendChild(document.createTextNode(' '));
	    
	    var nextbutton = document.createElement('a');
	    nextbutton.className = 'next';
	    nextbutton.appendChild(document.createTextNode('next >>'));
	    $(nextbutton).click(function(){
	        nextmonth();
	    });
	    topel.appendChild(nextbutton);
    }
    
    var weeksel = document.createElement('div');
    weeksel.className = 'weeks';
    rootel.appendChild(weeksel);

    for (var j = 0; j < layout.weeks.length; j++) {
        
    	var weekdata = layout.weeks[j];
        var weekel = document.createElement('div');
        weekel.className = 'week';
        var numberel = document.createElement('div');
        numberel.className = 'weeknumber';
        numberel.appendChild(document.createTextNode(weekdata.number));
        weekel.appendChild(numberel);
    
        for (var k = 0; k < weekdata.cells.length; k++) {
        	
            var celldata = weekdata.cells[k];
            var cellel = document.createElement('div');
            cellel.className = 'day column'+celldata.column;
            var numberel = document.createElement('div');
            numberel.className = 'daynumber';
            numberel.appendChild(document.createTextNode(celldata.date.toString("dd")));
            cellel.appendChild(numberel);
            weekel.appendChild(cellel);
        
        }
        
        var lastel = document.createElement('div');
        lastel.className = 'last';
        weekel.appendChild(lastel);
    

        var eventsel = document.createElement('div');
        eventsel.className ='weekevents';
        if( data.events )
        {
        	for( var k=0; k<data.events.length; k++ ){
        		var evt = data.events[k];
        		var d1 = Date.parseExact(evt.start, "yyyy-MM-dd");
        		var d2 = Date.parseExact(evt.end, "yyyy-MM-dd");

        		if( d1 > weekdata.date )
        		{
        			var eventel = document.createElement('div');
        			eventel.className ='weekevent';
        			eventel.innerHTML = 'event '+evt.title+' '+evt.start+' - '+evt.end;
        			eventsel.appendChild(eventel);
        		}
       		}
    	}
    	weeksel.appendChild(eventsel);
        
        
        weeksel.appendChild(weekel);
    
    }
    
    var eventsel = document.createElement('div');
    eventsel.className ='events';
    if( data.events )
    	for( var j=0; j<data.events.length; j++ ){
    		var evt = data.events[j];
    		var eventel = document.createElement('div');
    		eventel.className ='event';
    		eventel.innerHTML = 'event '+evt.title+' '+evt.start+' - '+evt.end;
    		eventsel.appendChild(eventel);
    	}
    rootel.appendChild(eventsel);
    
    target.innerHTML = '';
    target.appendChild(rootel);
    
    refreshdatecache(date, function(){
        rendermonth(target, date);
    });
}

function buildmonthdata(date){
    var data = {
        date: date,
        year: date.year,
        month: date.month,
        rows: 0,
        columns: 7,
        grid: [{
            row: 0,
            column: 0,
        }]
    };
    return data;
}

function initmonth(){
	debug("init month");
    var d = Date.today();
    currentmonth = d.toString("yyyy-MM");
    rendernextslide();
}

function inittags(){
	debug("init tags");
    rendertags();
    refreshtagcache(function(){
        rendertags();
    });
    loadtagdata(function(){
        rendertags();
    });
};

function rendertags(){
	debug("render tags");
}

function firstrun(){
    inittags();
    initmonth();
}

function rendernextslide(dir){
    var visiblelayer = null;
    var nextlayer = null;
    if (currentlayer == 1) {
        // prepare layer 2 and slide it in
        visiblelayer = $('#calendar1')[0];
        nextlayer = $('#calendar2')[0];
        currentlayer = 2;
    }
    else {
        visiblelayer = $('#calendar2')[0];
        nextlayer = $('#calendar1')[0];
        currentlayer = 1;
    }
    
    rendermonth(nextlayer, currentmonth);
    
    var offside = 1000;
    var visiblestart = 0;
    var visibleend = (dir == 1) ? offside : -offside;
    var nextend = 0;
    var nextstart =  (dir == 1) ? -offside : offside;
    
    visiblelayer.className = 'monthwrapper offside';
    nextlayer.className = 'monthwrapper current';
    
    $(visiblelayer).css({ 'left': visiblestart + 'px', 'opacity':1.0 });
    $(nextlayer).css({ 'left': nextstart + 'px', 'opacity':0.0 });
    $(visiblelayer).animate({ 'left': visibleend + 'px', 'opacity':1.0 },400,'easeInCubic');
    setTimeout(function(){ $(nextlayer).animate({ 'left': nextend + 'px', 'opacity':1.0 },500,'easeOutCubic'); },200);
}


function changemonth(delta){
	debug('change month ' + delta);
	debug('old tag: ', currentmonth);
    var d = Date.parseExact(currentmonth, 'yyyy-MM');
    debug('old date: ', d);
    d = d.add(delta).months();
    debug('new date: ', d);
    currentmonth = d.toString('yyyy-MM');
    debug('new tag: ', currentmonth);
    rendernextslide(-delta);
}

function prevmonth(){
    changemonth(-1);
}

function nextmonth(){
    changemonth(1);
}
