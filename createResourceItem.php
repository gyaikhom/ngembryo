<?php

include 'utils.php';

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', rid: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$rid = $_POST[rid];
$title = $_POST[title];
$abstract = $_POST[description];
$mime = $_POST[mime];
$link = $_POST[link];

/* Escape quotes etc. */
$title = return_well_formed($title);
$abstract = return_well_formed($abstract);
$mime = return_well_formed($mime);
$link = return_well_formed($link);

/* Check if the resource exists. */
$sql = "SELECT * FROM resource WHERE id='$rid'";
if ($result = mysql_query($sql, $con)) {
	if (!mysql_fetch_array($result)) {
		die('{success: false, errcode: -2, message: "Resource does not exists. No new resource item can be created.", rid: 0}');
	}
} else {
	die('{success: false, errcode: 3, message: '.json_encode(mysql_error()).', rid: 0}');
}

/* Check if a resource item with the given title, mime, and link exists. */
$sql = "SELECT * FROM resourceItem WHERE resource_id='$rid' AND title='$title' AND mime='$mime' AND link='$link'";
if ($result = mysql_query($sql, $con)) {
	if ($temp = mysql_fetch_array($result)) {
		die('{success: false, errcode: -2, message: "Resource item already exists. No new resource item created.", rid: '.$temp['id'].'}');
	}
} else {
	die('{success: false, errcode: 3, message: '.json_encode(mysql_error()).', rid: 0}');
}

/* Create a new resource item. */
$sql = "INSERT INTO resourceItem (resource_id, title, abstract, mime, link, created_at) VALUES ('$rid', '$title', '$abstract', '$mime', '$link', NOW())";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: 6, message: '.json_encode(mysql_error()).', rid: 0}');
}
$rid = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New resource item created.", rid:'.$rid.'}';

mysql_close($con);
?>
