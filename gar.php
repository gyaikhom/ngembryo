<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', resources: null}');
}

mysql_select_db("ngembryo", $con);

$aid = $_GET[aid];
$type = $_GET[type];
$exclude = $_GET[exclude];
$format = $_GET[format];
$table = "";

if ($type == "m") {
	$table = "2Dmarker";
} else {
	if ($type == "r") {
		$table = "2Dregion";
	} else {
		die('{success: false, errcode: 2, message: "Unknown annotation type.", resources: null}');
	}
}

/* Check if the annotation exists. */
$annotation = mysql_query("SELECT id FROM $table WHERE deleted_at IS NULL AND id=$aid");
if ($temp = mysql_fetch_array($annotation)) {
	$aid = $temp['id'];
} else {
	die('{success: false, errcode: -1, message: "Supplied annotation does not exists.", resources: null}');
}

/**
 * This is the old version with resource items.
 *
 function printResource($resource) {
 echo '{ id: '.$resource['id'].', author: '.json_encode($resource['author']).', title: '.json_encode($resource['title']).', description: '.json_encode($resource['abstract']).', resourceItems: ';
 $resourceItems = mysql_query("SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['resource.id']."'");
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
 echo ' }';
 }
 */

/**
 * This is the new version according to the requirement from April 30, meeting at NCL.
 * No more resource items. Only a flat list of resources.
 */
function printResource($resource) {
	echo '{ id: '.$resource['id'].', author: '.json_encode($resource['author']).', title: '.json_encode($resource['title']).', description: '.json_encode($resource['abstract']).', link: ';
	$resourceItems = mysql_query("SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['id']."' LIMIT 1");
	if ($item = mysql_fetch_array($resourceItems)) {
		echo json_encode($item['link']);
	} else {
		echo 'null';
	}
	echo ' }';
}

/* Get all of the resources linked (or not linked) to this annotation. */
$table = $table."Resource";
if ($exclude) {
	$sql = "SELECT DISTINCT resource.id, resource.title, resource.author, resource.abstract FROM resource WHERE resource.deleted_at IS NULL AND resource.id NOT IN (SELECT DISTINCT resource.id FROM resource LEFT JOIN $table ON $table.resource_id=resource.id WHERE resource.deleted_at IS NULL AND $table.annotation_id=$aid)";
}
else {
	$sql = "SELECT DISTINCT resource.id, resource.title, resource.author, resource.abstract FROM resource LEFT JOIN $table ON $table.resource_id=resource.id WHERE resource.deleted_at IS NULL AND $table.annotation_id IS NOT NULL AND $table.annotation_id=$aid";
}

/* For each of the resources, retrieve the resource details. */
if (($resources = mysql_query($sql, $con))) {
	if ($format == "json") {
		echo '{success: true, errcode: 0, message: "Resources retrieved successfully.", resources: [';
		if ($resource = mysql_fetch_array($resources))
		printResource($resource);
		while ($resource = mysql_fetch_array($resources)) {
			echo ',';
			printResource($resource);
		}
		echo ']}';
	} else {
		if ($format == "csv") {
			print('id,author,title,abstract,url'."\n");
			while ($resource = mysql_fetch_array($resources)) {
				print($resource['id'].', "'.$resource['author'].'", "'.$resource['title'].'", "'.$resource['abstract'].'", ""'."\n");
			}
		} else {
			echo '<response><success>true</success><errcode>0</errcode><message>Resources retrieved successfully.</message><resources>';
			while ($resource = mysql_fetch_array($resources)) {
				echo '<resource><id>'.$resource['id'].'</id><author>'.$resource['author'].'</author><title>'.$resource['title'].'</title><description>'.$resource['abstract'].'</description><resourceItems>';
				$resourceItems = mysql_query("SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['id']."'");
				while ($item = mysql_fetch_array($resourceItems)) {
					echo '<item><id>'.$item['id'].'</id><title>'.$item['title'].'</title><description>'.$item['abstract'].'</description><mime>'.$item['mime'].'</mime><link>'.$item['link'].'</link></item>';
				}
				echo '</resourceItems></resource>';
			}
			echo '</resources></response>';
		}
	}
} else {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', resources: null}');
}

mysql_close($con);

?>