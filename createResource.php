<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", rid: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$title = $_POST[title];
$author = $_POST[author];
$abstract = $_POST[description];

/* Escape quotes etc. */
$title = mysql_escape_string($title);
$author = mysql_escape_string($author);
$abstract = mysql_escape_string($abstract);

/* Check if a resource with the given title and author exists. */
$sql = "SELECT * FROM resource WHERE author='$author' AND title='$title'";
if ($result = mysql_query($sql, $con)) {
	if ($temp = mysql_fetch_array($result)) {
		die('{success: false, errcode: -2, message: "Resource with the given title already exists. No new resource created.", rid: '.$temp['id'].'}');
	}
} else {
	die('{success: false, errcode: 3, message: "MySQL Query error:'.mysql_error().'", rid: 0}');
}

/* Create a new resource. */
$sql = "INSERT INTO resource (title, author, abstract, created_at) VALUES ('$title', '$author', '$abstract', NOW())";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: 6, message: "MySQL Query error:'.mysql_error().'", rid: 0}');
}
$rid = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New resource created.", rid:'.$rid.'}';

mysql_close($con);
?>
