<?php

include 'utils.php';

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', rid: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$title = $_POST[title];
$author = $_POST[author];
$link = $_POST[link]; /* New requirement: Just a flat list of resources. */
$abstract = $_POST[description];

/* Escape quotes etc. */
$title = return_well_formed($title);
$author = return_well_formed($author);
$abstract = return_well_formed($abstract);

/* Check if a resource with the given title and author exists. */
$sql = "SELECT * FROM resource WHERE author='$author' AND title='$title'";
if ($result = mysql_query($sql, $con)) {
	if ($temp = mysql_fetch_array($result)) {
		die('{success: false, errcode: -2, message: "Resource with the given title already exists. No new resource created.", rid: '.$temp['id'].'}');
	}
} else {
	die('{success: false, errcode: 3, message: '.json_encode(mysql_error()).', rid: 0}');
}

/* Create a new resource. */
$sql = "INSERT INTO resource (title, author, abstract, created_at) VALUES ('$title', '$author', '$abstract', NOW())";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: 6, message: '.json_encode(mysql_error()).', rid: 0}');
}
$rid = mysql_insert_id();

/* Create a new resource item.
 * 
 * NOTE: This is according to the new requirement from April 30 meeting at NCL.
 * We have attempted to minimise changes to the existing database. So, every resource will
 * now have only one resource item. User cannot add new resource items.
 */
$sql = "INSERT INTO resourceItem (resource_id, title, abstract, link, created_at) VALUES ('$rid', '$title', '$abstract', '$link', NOW())";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: 6, message: '.json_encode(mysql_error()).', rid: 0}');
}

echo '{success: true, errcode: 0, message: "New resource created.", rid:'.$rid.'}';

mysql_close($con);
?>
