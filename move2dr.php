<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$aid = $_POST[aid];
$lid = $_POST[lid];

/* For the moment, a region can only belong to a single layer. */
$sql = "DELETE from layer2Dregion WHERE annotation_id='$aid'";
if (!mysql_query($sql, $con)) {
	die('Error: '.mysql_error());
}

$sql = "INSERT INTO layer2Dregion (annotation_id, layer_id, created_at) VALUES ('$aid', '$lid', NOW())";
if (!mysql_query($sql, $con)) {
	die('Error: '.mysql_error());
}

mysql_close($con);
?>
