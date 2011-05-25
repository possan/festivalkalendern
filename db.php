<?php

$ical_url = "http://www.google.com/calendar/ical/sour.se_3ncttv6e3n5im5gvpepto9etls%40group.calendar.google.com/public/basic.ics";
$ical_file = "/tmp/basic.ics";
$ical_ttl = 6*60;
$json_file = "/tmp/basic.json";
$json_ttl = 7*60;

$date = "2011-01";
if( isset( $argv[1] ) )
$date = $argv[1];
if( isset( $_GET["date"] ) )
$date = $_GET["date"];
$t = strptime($date, "%Y-%m");
// $t = strptime($date, "%Y");
$ts1 = mktime( 0,0,0, $t["tm_mon"]+1,1,$t["tm_year"]+1900 );
$ts2 = mktime( 0,0,0, $t["tm_mon"]+2,0,$t["tm_year"]+1900 );
// $ts1 = mktime( 0,0,0, 1,1,$t["tm_year"]+1900 );
// $ts2 = mktime( 0,0,0, 1,0,$t["tm_year"]+1901 );

function get_mtime( $fn ){
	$age = 0;
	if( file_exists( $fn ) ) {
		$st = stat( $fn );
		$age = $st["mtime"];
	}
	return $age;
}

function get_age( $fn ){
	$age = time() - get_mtime( $fn );
	return $age;
}

function parse_ical_date( $dt ) {
	$t = strptime( $dt, "%Y%m%d" );
	// echo "dt = $dt t = ";
	// print_r( $t );
	// echo "\n";
	$t2 = mktime( 0,0,0, $t["tm_mon"]+1, $t["tm_mday"],$t["tm_year"]+1900 );
	return $t2;
}

function format_json_date( $ts ) {
	return date("Y-m-d", $ts );
}

$json_mtime = get_mtime( $json_file );
$etag = $json_mtime."-".$ts1."-".$ts2;
$qetag = getenv("HTTP_IF_NONE_MATCH");

header( "Content-type: application/x-javascript" );
header( "ETag: ".$etag );
$expires = $json_ttl;
header( "Pragma: public" );

header( "Last-Modified: ".gmdate("D, d M Y H:i:s", $json_mtime)." GMT");
header( "Cache-Control: maxage=".$expires );
header( 'Expires: ' . gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT' );

// header( "Cache-Control: must-revalidate" );

// print_r( $_SERVER );
// print_r( $_ENV );
// echo "etag=".$etag." - qetag=".$qetag." - ";


//	if( $qetag == $etag ) {
//		header ("HTTP/1.0 304 Not Modified");
//		header('Content-Length: 0');
//		flush();
//	}

$ical_age = get_age( $ical_file );
$json_age = get_age( $json_file );

if( $ical_age > $ical_ttl ) {
	// echo "updating disk ical cache.\n2";
	copy( $ical_url, $ical_file );
}

if( $json_age > $json_ttl ) {
	$f = file_get_contents($ical_file);
	$f = preg_replace("/[\r\n]+[ \t]+/", '$2', $f);
	$lines = preg_split("/[\r\n]+/", $f);
	$db = new stdclass();
	$db->events = array();
	$evt = null;
	foreach( $lines as $l ) {
		$l = trim($l);
		$o = strpos( $l, ':' );
		$tag = substr( $l, 0, $o );
		$args = substr( $l, $o+1 );
		// echo "Parsing tag=".$tag." args=".$args."<br/>\n";
		if( $tag == "BEGIN" && $args == "VEVENT") {
			$evt = new stdclass();
		} else if( $tag == "END" && $args == "VEVENT") {
			$db->events[] = $evt;
		} else if( $tag == "UID" ) {
			$evt->id = $args;
		} else if( $tag == "DTSTART;VALUE=DATE" ) {
			$evt->start_ts = parse_ical_date($args);
			$evt->start = format_json_date( $evt->start_ts );
		} else if( $tag == "DTEND;VALUE=DATE" ) {
			$evt->end_ts = parse_ical_date($args);
			$evt->end = format_json_date( $evt->end_ts );
		} else if( $tag == "SUMMARY" ) {
			$evt->title = $args;
		} else if( $tag == "DESCRIPTION" ) {
			$args = preg_replace( "/\\\\n/", "\n", $args );
			$args = preg_replace( "/\\\,/", ",", $args );
			$evt->metadata = json_decode($args);
		} else {
			// echo "Parsing: ".$l." <br/>\n";
		}
	}
	// print_r($db);
	$json_data = json_encode($db);
	$f = fopen( $json_file, "wt" );
	fputs( $f, $json_data );
	fclose( $f );
	// phpinfo();
}

//	if (@strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) == $json_mtime || trim($_SERVER['HTTP_IF_NONE_MATCH']) == $etag) {
//	    header("HTTP/1.1 304 Not Modified");
//	    exit;
//	}

//	if( $qetag == $etag )
//		return;

// parse json
$json_data = file_get_contents( $json_file );
// echo $json_data;

// filter events
$data = json_decode( $json_data );
$newdata = new stdclass();
$newdata->events = array();
$newdata->date = $date;
$newdata->random = rand();
$newdata->start_ts = $ts1;
$newdata->end_ts = $ts2;
$newdata->start = format_json_date( $ts1 );
$newdata->end = format_json_date( $ts2 );
// print_r( $data );
foreach( $data->events as $evt ) {
	$evt->test = rand();

	$ets1 = $evt->start_ts;
	$ets2 = $evt->end_ts;

	if( ($ets1 >= $ts1 && $ets2 < $ts2 ) )
	$newdata->events[] = $evt;
	else if( ($ets1 < $ts1 && $ets2 > $ts1 && $ets2 < $ts2 ) )
	$newdata->events[] = $evt;
	else if( ($ets1 >= $ts1 && $ets1 < $ts2 && $ets2 > $ts2 ) )
	$newdata->events[] = $evt;

}
$json_data = json_encode( $newdata );
echo $json_data;
// echo "\n<!-- \n";
// print_r( $newdata );
// echo "\n-->\n";


?>
