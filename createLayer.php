<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", lid: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$title = $_POST[title];
$summary = $_POST[summary];
$description = $_POST[description];
$model = $_POST[model];
$yaw = $_POST[yaw];
$pitch = $_POST[pitch];
$roll = $_POST[roll];
$distance = $_POST[distance];

/* Escape quotes etc. */
$title = mysql_escape_string($title);
$summary = mysql_escape_string($summary);
$description = mysql_escape_string($description);

/* Check if the orientation exists. */
$sql = "SELECT * FROM orientation WHERE mid='$model' AND yaw='$yaw' AND pitch='$pitch' AND roll='$roll' AND distance='$distance'";
if ($result = mysql_query($sql, $con)) {
	if ($x = mysql_fetch_array($result)) {
		$oid = $x['id'];

		/* Check if a layer with the given title exists. */
		$sql = "SELECT * FROM layer WHERE oid='$oid' AND title='$title'";
		if ($result = mysql_query($sql, $con)) {
			if ($x = mysql_fetch_array($result)) {
				die('{success: false, errcode: -2, message: "Layer with the given title already exists. No new layer created.", lid: '.$x['id'].'}');
			}
		} else {
			die('{success: false, errcode: 3, message: "MySQL Query error:'.mysql_error().'", lid: 0}');
		}
	} else {
		/* Create a new orientation. */
		$sql = "INSERT INTO orientation (mid, yaw, pitch, roll, distance, created_at) VALUES ('$model', '$yaw', '$pitch', '$roll', '$distance', NOW())";
		if (!mysql_query($sql, $con)) {
			die('{success: false, errcode: 4, message: "MySQL Query error:'.mysql_error().'", lid: 0}');
		}
		$oid = mysql_insert_id();
	}
} else {
	die('{success: false, errcode: 5, message: "MySQL Query error:'.mysql_error().'", lid: 0}');
}

/* Create a new layer using this orientation. */
$sql = "INSERT INTO layer (oid, title, summary, description, created_at) VALUES ('$oid', '$title', '$summary', '$description', NOW())";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: 6, message: "MySQL Query error:'.mysql_error().'", lid: 0}');
}
$lid = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New layer created.", lid:'.$lid.'}';

mysql_close($con);
?>
