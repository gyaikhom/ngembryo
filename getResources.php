<?php
$rid = $_GET['rid'];
$format = $_GET['format'];

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($format == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', resources: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:'.mysql_error().'</message><resources></resources></response>';
	}
}
mysql_select_db("ngembryo", $con);

/* Find the resources. */
$items = false;
if ($rid == "") {
	$sql = "SELECT * FROM resource WHERE deleted_at IS NULL";
	$items = false;
} else {
	$sql = "SELECT * FROM resource WHERE deleted_at IS NULL AND id=$rid";
	$items = true;
}

/**
 * Get the first resource item always.
 * NOTE: Changes to requirement. Flat resource listing. No resource items.
 */
$items = true;

if (!($result = mysql_query($sql, $con))) {
	if ($format == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', resources: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL Query error:'.mysql_error().'</message><resources></resources></response>';
	}
}

/**
 * Old version with resource items.
 * 
function printResource($items, $resource) {
	echo '{ id: '.$resource['id'].', author: '.json_encode($resource['author']).', title: '.json_encode($resource['title']).', description: '.json_encode($resource['abstract']);
	if ($items == true) {
		echo ', resourceItems: '; 
		$resourceItems = mysql_query("SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['id']."' LIMIT 1");
		if ($item = mysql_fetch_array($resourceItems)) {
			$count = 1;
			echo '[{id: '.$item['id'].', title: '.json_encode($item['title']).', description: '.json_encode($item['abstract']).', mime: '.json_encode($item['mime']).', link: '.json_encode($item['link']).'}';
			while ($item = mysql_fetch_array($resourceItems)) {
				echo ', {id: '.$item['id'].', title: '.json_encode($item['title']).', description: '.json_encode($item['abstract']).', mime: '.json_encode($item['mime']).', link: '.json_encode($item['link']).'}';
				$count++;
			}
			echo ']';
		} else {
			echo 'null';
		}
	}
	echo ' }';
}*/

/**
 * This is the new version according to the requirement from April 30, meeting at NCL.
 * No more resource items. Only a flat list of resources.
 */
function printResource($items, $resource) {
    echo '{ id: '.$resource['id'].', author: '.json_encode($resource['author']).', title: '.json_encode($resource['title']).', description: '.json_encode($resource['abstract']).', link: ';
    $resourceItems = mysql_query("SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['id']."' LIMIT 1");
    if ($item = mysql_fetch_array($resourceItems)) {
        echo json_encode($item['link']);
    } else {
        echo 'null';
    }
    echo ' }';
}
if ($format == "json") {
	echo '{success: true, errcode: 0, message: "Resources retrieved successfully.", resources: [';
	if ($resource = mysql_fetch_array($result))
	printResource($items, $resource);
	while ($resource = mysql_fetch_array($result)) {
		echo ',';
		printResource($items, $resource);
	}
	echo ']}';
} else {
	echo '<response><success>true</success><errcode>0</errcode><message>Resources retrieved successfully.</message><resources>';
	while ($resource = mysql_fetch_array($result)) {
		echo '<resource><id>'.$resource['id'].'</id><author>'.$resource['author'].'</author><title>'.$resource['title'].'</title><description>'.$resource['abstract'].'</description>';
		if ($items == true) {
			echo '<resourceItems>';
			$resourceItems = mysql_query("SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['id']."'");
			while ($item = mysql_fetch_array($resourceItems)) {
				echo '<item><id>'.$item['id'].'</id><title>'.$item['title'].'</title><description>'.$item['abstract'].'</description><mime>'.$item['mime'].'</mime><link>'.$item['link'].'</link></item>';
			}
			echo '</resourceItems>';
		}
		echo '</resource>';
	}
	echo '</resources></response>';
}

mysql_close($con);
?>
