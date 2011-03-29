var currentmonth = 'xxxx-xx';
var currenttags = [];
var currentlayer = -1;

function debug(x){
if( console )
	if( console.log )
		console.log(x);
}
 
var tagcache = { "lastupdate": "timestamp", "tags": [] };

var monthcache = { };
 
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
        if (testweek != lastweek) {
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
    
    var rootel = $('<div class="month" />');
    var topel = $('<div class="top" />');
    rootel.append(topel);
    {
	    var prevbutton = $('<a class="previous" />');
	    prevbutton.text('<< previous');
	    prevbutton.click(function(){
	        changemonth(-1);
	    });
	    topel.append(prevbutton);
	    topel.append(' ');
	    var titleel = $('<span class="title" />');
	    titleel.text(layout.date.toString("MMMM, yyyy"));
	    topel.append(titleel);
	    topel.append(' ');
	    var nextbutton = $('<a class="next" />');
	    nextbutton.text('next >>');
	    nextbutton.click(function(){
	        changemonth(1);
	    });
	    topel.append(nextbutton);
    }
    
    var weeksel = $('<div class="weeks" />');
    rootel.append(weeksel);

    for (var j = 0; j < layout.weeks.length; j++) {
        
    	var weekdata = layout.weeks[j];
        var weekel = $('<div class="week" />');
        var numberel = $('<div class="weeknumber" />');
        numberel.text(weekdata.number);
        weekel.append(numberel);

        if( data.events )
        	for( var l=0; l<data.events.length; l++ ){
        		var evt = data.events[l];
        		evt._firstcolumn = 99;
        		evt._lastcolumn = -99;
        		evt._used = false;
        	}
        
        for (var k = 0; k < weekdata.cells.length; k++) {        	
            var celldata = weekdata.cells[k];
            var cellel = $('<div class="day column'+celldata.column+'" />' );
            var numberel = $('<div class="daynumber" />');
            numberel.text(celldata.date.toString("dd"));
            cellel.append(numberel);            
            if( data.events )
            	for( var l=0; l<data.events.length; l++ ){
            		var evt = data.events[l];
            		var d1 = Date.parseExact(evt.start, "yyyy-MM-dd");
            		var d2 = Date.parseExact(evt.end, "yyyy-MM-dd");
            		if( d1 <= celldata.date && d2 > celldata.date)
            		{
            			if( celldata.column < evt._firstcolumn )
            				evt._firstcolumn = celldata.column;
            			if( celldata.column > evt._lastcolumn )
            				evt._lastcolumn = celldata.column;
            			evt._used = true;
            		}
           		}
            weekel.append(cellel);
        }
        
        weekel.append($('<div class="last" />'));
        
        var eventsel = $('<div class="weekevents" />');
        if( data.events )
        {
        	for( var k=0; k<data.events.length; k++ ){
        		var evt = data.events[k];
        		var d1 = Date.parseExact(evt.start, "yyyy-MM-dd");
        		var d2 = Date.parseExact(evt.end, "yyyy-MM-dd");
        		if( !evt._used )
        			continue;
        		var eventlineel = $('<div class="weekeventline" />');
        		var eventel = $('<div/>');
       			eventel.addClass('weekevent eventstart'+evt._firstcolumn+' eventlength'+(1+evt._lastcolumn-evt._firstcolumn)+' eventcolor'+(k%6));
       			var innerel = $('<div class="weekeventinner" />');
      			innerel.html(evt.title);
      			eventel.append(innerel);
      			eventlineel.append(eventel);
     			eventsel.append(eventlineel[0]);
        	}
    	}
    	weekel.append(eventsel);
        weeksel.append(weekel);
    }
    
    var eventsel = $('<div class="events" />');
    if( data.events )
    	for( var j=0; j<data.events.length; j++ ){
    		var evt = data.events[j];
    		var eventel = $('<div class="event" />');
    		eventel.innerHTML = 'event '+evt.title+' '+evt.start+' - '+evt.end;
    		eventsel.append(eventel);
    	}
    rootel.append(eventsel);
    
    $(target).html('');
    $(target).append(rootel);
    
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
    $('.monthviewport').swipe({ 
    	swipeLeft: function() { changemonth(-1); },
        swipeRight: function() { changemonth(1); }
       });
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