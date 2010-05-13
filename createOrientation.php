<?php

include 'utils.php';

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, message: '.json_encode(mysql_error()).', oid: -1}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$title = $_POST[title];
$description = $_POST[description];
$model = $_POST[model];
$yaw = $_POST[yaw];
$pitch = $_POST[pitch];
$roll = $_POST[roll];
$distance = $_POST[distance];

/* Escape quotes etc. */
$title = return_well_formed($title);
$description = return_well_formed($description);

/* First check if the current orientation exists. */
$orientations = mysql_query("SELECT id FROM orientation WHERE deleted_at IS NULL AND model_id=$model AND yaw=$yaw AND pitch=$pitch AND roll=$roll AND distance=$distance");
if ($x = mysql_fetch_array($orientations)) {
	$orientation_id = $x['id'];
	echo '{success: false, message: "Orientation already exists.", oid:'.$orientation_id.'}';
} else {
	/* Create a new orientation. */
	$sql = "INSERT INTO orientation (model_id, title, description, yaw, pitch, roll, distance, created_at) VALUES ('$model', '$title', '$description', '$yaw', '$pitch', '$roll', '$distance', NOW())";
	if (!mysql_query($sql, $con)) {
		die('{success: false, message: '.json_encode(mysql_error()).', oid: -1}');
	}
	$orientation_id = mysql_insert_id();
	echo '{success: true, message: "New orientation created.", oid:'.$orientation_id.'}';
}

mysql_close($con);
?>
