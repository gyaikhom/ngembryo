<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", resources: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:'.mysql_error().'</message><resources></resources></response>';
	}
}
mysql_select_db("ngembryo", $con);

/* Find all of the resources. */
$sql = "SELECT * FROM resource";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: "MySQL Query error:'.mysql_error().'", resources: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL Query error:'.mysql_error().'</message><resources></resources></response>';
	}
}

function printResource($resource) {
	echo '{ id: '.$resource['id'].', author: "'.$resource['author'].'", title: "'.$resource['title'].'", description: "'.$resource['abstract'].'", resourceItems: ';
	$resourceItems = mysql_query("SELECT * FROM resourceItem WHERE rid='".$resource['id']."'");
	if ($item = mysql_fetch_array($resourceItems)) {
		$count = 1;
		echo '[{title: "'.$item['title'].'", description: "'.$item['abstract'].'", mime: "'.$item['mime'].'", link: "'.$item['link'].'"}';
		while ($item = mysql_fetch_array($resourceItems)) {
			echo ', {title: "'.$item['title'].'", description: "'.$item['abstract'].'", mime: "'.$item['mime'].'", link: "'.$item['link'].'"}';
			$count++;
		}
		echo ']';
	} else {
		echo 'null';
	}
	echo ' }';
}

if ($_GET[format] == "json") {
	echo '{success: true, errcode: 0, message: "Resources retrieved successfully.", resources: [';
	if ($resource = mysql_fetch_array($result))
	printResource($resource);
	while ($resource = mysql_fetch_array($result)) {
		echo ',';
		printResource($resource);
	}
	echo ']}';
} else {
	echo '<response><success>true</success><errcode>0</errcode><message>resources retrieved successfully.</message><resources>';
	while ($resource = mysql_fetch_array($result)) {
		echo '<resource><id>'.$resource['id'].'</id><author>'.$resource['author'].'</author><title>'.$resource['title'].'</title><description>'.$resource['abstract'].'</description><resourceItems>';
		$resourceItems = mysql_query("SELECT * FROM resourceItem WHERE rid='".$resource['id']."'");
		while ($item = mysql_fetch_array($resourceItems)) {
			echo '<item><title>'.$item['title'].'</title><description>'.$item['abstract'].'</description><mime>'.$item['mime'].'</mime><link>'.$item['link'].'</link></item>';
		}
		echo '</resourceItems></resource>';
	}
	echo '</resources></response>';
}

mysql_close($con);
?>
