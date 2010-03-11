<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, message: "MySQL connection error:'.mysql_error().'", oid: -1}');
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


/* First check if the current orientation exists. */
$orientations = mysql_query("SELECT id FROM orientation WHERE mid=$model AND yaw=$yaw AND pitch=$pitch AND roll=$roll AND distance=$distance");
if ($x = mysql_fetch_array($orientations)) {
	$oid = $x['id'];
	echo '{success: false, message: "Orientation already exists.", oid:'.$oid.'}';
} else {
	/* Create a new orientation. */
	$sql = "INSERT INTO orientation (mid, title, description, yaw, pitch, roll, distance, created_at) VALUES ('$model', '$title', '$description', '$yaw', '$pitch', '$roll', '$distance', NOW())";
	if (!mysql_query($sql, $con)) {
		die('{success: false, message: "MySQL Query error:'.mysql_error().'", oid: -1}');
	}
	$oid = mysql_insert_id();
	echo '{success: true, message: "New orientation created.", oid:'.$oid.'}';
}

mysql_close($con);
?>
