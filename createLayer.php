<?php

include 'utils.php';

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', lid: 0}');
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
$title = return_well_formed($title);
$summary = return_well_formed($summary);
$description = return_well_formed($description);

/* Check if the orientation exists. */
$sql = "SELECT * FROM orientation WHERE model_id='$model' AND yaw='$yaw' AND pitch='$pitch' AND roll='$roll' AND distance='$distance'";
if ($result = mysql_query($sql, $con)) {
	if ($x = mysql_fetch_array($result)) {
		$orientation_id = $x['id'];

		/* Check if a layer with the given title exists. */
		$sql = "SELECT * FROM layer WHERE orientation_id='$orientation_id' AND title='$title'";
		if ($result = mysql_query($sql, $con)) {
			if ($x = mysql_fetch_array($result)) {
				die('{success: false, errcode: -2, message: "Layer with the given title already exists. No new layer created.", lid: '.$x['id'].'}');
			}
		} else {
			die('{success: false, errcode: 3, message: '.json_encode(mysql_error()).', lid: 0}');
		}
	} else {
		/* Create a new orientation. */
		$sql = "INSERT INTO orientation (model_id, yaw, pitch, roll, distance, created_at) VALUES ('$model', '$yaw', '$pitch', '$roll', '$distance', NOW())";
		if (!mysql_query($sql, $con)) {
			die('{success: false, errcode: 4, message: '.json_encode(mysql_error()).', lid: 0}');
		}
		$orientation_id = mysql_insert_id();
	}
} else {
	die('{success: false, errcode: 5, message: '.json_encode(mysql_error()).', lid: 0}');
}

/* Create a new layer using this orientation. */
$sql = "INSERT INTO layer (orientation_id, title, summary, description, created_at) VALUES ('$orientation_id', '$title', '$summary', '$description', NOW())";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: 6, message: '.json_encode(mysql_error()).', lid: 0}');
}
$lid = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New layer created.", lid:'.$lid.'}';

mysql_close($con);
?>
