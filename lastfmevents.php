<?php
	
	include dirname( __FILE__ ) . '/phpillow/bootstrap.php';

	$location = "sweden";
	$apikey = "96f7209908557bda19520385b8905d72";
	phpillowConnection::createInstance('www2.sour.se', 5984, '', '');

	for( $p=1; $p<10; $p++ ) {
		$fn = "/tmp/events-page".$p.".xml";
		$st = @stat( $fn );
		$age = time() - $st["mtime"];
		echo "getting; page=$p (".$fn." - age ".$age.")\n";
//		echo "age = ".$age;
//		print_r( $st );
		if( $age < $p*60 )
			continue;
		$url = "http://ws.audioscrobbler.com/2.0/?method=geo.getevents&location=".
			$location."&api_key=".$apikey."&page=".$p;
		copy( $url, "/tmp/events-page".$p.".xml" );
	}
	
	for( $p=1; $p<10; $p++ ) {
		$xmlstr = join( "\n", file( "/tmp/events-page".$p.".xml" ) );
		$xml = new SimpleXMLElement($xmlstr);
		for( $k=0; $k<count($xml->events->event); $k++ ){
			$e = $xml->events->event[$k];
			// print_r( $e );

			$id = $e->id;
			echo "got event #".$id.": ".$e->title."\n";
			$e->_id = "event-".$id;
			$rev = "";

			try {
				$red = phpillowConnection::getInstance()->get("/events/event-".$id);
				if( isset( $red ) &&  $red->_rev )
					$e->_rev = $red->_rev;
			} catch( Exception $e ) {
			}

			// $rev = $red->_rev;
			// phpillowConnection::getInstance()->delete("/events/event-".$id);

			$jd = json_encode( $e );

		//	echo $jd;

			phpillowConnection::getInstance()->put("/events/event-".$id, $jd);

		//	die( "" );

		}
	}





?>
