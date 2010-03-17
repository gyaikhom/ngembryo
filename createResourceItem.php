<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", rid: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$rid = $_POST[rid];
$title = $_POST[title];
$abstract = $_POST[description];
$mime = $_POST[mime];
$link = $_POST[link];

/* Escape quotes etc. */
$title = mysql_escape_string($title);
$abstract = mysql_escape_string($abstract);
$mime = mysql_escape_string($mime);
$link = mysql_escape_string($link);

/* Check if the resource exists. */
$sql = "SELECT * FROM resource WHERE id='$rid'";
if ($result = mysql_query($sql, $con)) {
	if (!mysql_fetch_array($result)) {
		die('{success: false, errcode: -2, message: "Resource does not exists. No new resource item can be created.", rid: 0}');
	}
} else {
	die('{success: false, errcode: 3, message: "MySQL Query error:'.mysql_error().'", rid: 0}');
}

/* Check if a resource item with the given title, mime, and link exists. */
$sql = "SELECT * FROM resourceItem WHERE rid='$rid' AND title='$title' AND mime='$mime' AND link='$link'";
if ($result = mysql_query($sql, $con)) {
	if ($temp = mysql_fetch_array($result)) {
		die('{success: false, errcode: -2, message: "Resource item already exists. No new resource item created.", rid: '.$temp['id'].'}');
	}
} else {
	die('{success: false, errcode: 3, message: "MySQL Query error:'.mysql_error().'", rid: 0}');
}

/* Create a new resource item. */
$sql = "INSERT INTO resourceItem (rid, title, abstract, mime, link, created_at) VALUES ('$rid', '$title', '$abstract', '$mime', '$link', NOW())";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: 6, message: "MySQL Query error:'.mysql_error().'", rid: 0}');
}
$rid = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New resource item created.", rid:'.$rid.'}';

mysql_close($con);
?>
