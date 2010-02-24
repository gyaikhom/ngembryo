<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$aid = $_POST[aid];
$lid = $_POST[lid];

/* For the moment, a region can only belong to a single layer. */
$sql = "DELETE from Layer2Dregion WHERE aid='$aid'";
if (!mysql_query($sql, $con)) {
	die('Error: '.mysql_error());
}

$sql = "INSERT INTO Layer2Dregion (aid, lid) VALUES ('$aid', '$lid')";
if (!mysql_query($sql, $con)) {
	die('Error: '.mysql_error());
}

mysql_close($con);
?>
