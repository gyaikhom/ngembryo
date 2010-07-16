<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', layers: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:'.mysql_error().'</message><layers></layers></response>';
	}
}
mysql_select_db("ngembryo", $con);

$model = $_GET[model];
$yaw = $_GET[yaw];
$pitch = $_GET[pitch];
$roll = $_GET[roll];
$distance = $_GET[distance];

/* Find the orientation. */
$sql = "SELECT * FROM orientation WHERE deleted_at IS NULL AND model_id='$model' AND yaw='$yaw' AND pitch='$pitch' AND roll='$roll' AND distance='$distance'";
if ($result = mysql_query($sql, $con)) {
	if ($x = mysql_fetch_array($result)) {
		$orientation_id = $x['id'];
	} else {
		die('{success: false, errcode: -3, message: "Found no orientation with the supplied parameters.", layers: null}');
	}
} else {
	die('{success: false, errcode: 2, message: '.json_encode(mysql_error()).', layers: null}');
}

/* Find all of the layers for this orientation. */
$sql = "SELECT * FROM layer WHERE deleted_at IS NULL AND orientation_id=$orientation_id";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 2, message: '.json_encode(mysql_error()).', layers: null}');
	} else {
		echo '<response><success>false</success><errcode>2</errcode><message>MySQL Query error:'.mysql_error().'</message><layers></layers></response>';
	}
}

if ($_GET[format] == "json") {
	echo '{success: true, errcode: 0, message: "Layers retrieved successfully.", layers: [';
	if ($row = mysql_fetch_array($result)) {
		echo '{ id: '.$row['id'].', visible: true, title: '.json_encode($row['title']).', summary: '.json_encode($row['summary']).', description: '.json_encode($row['description']).' }';
	}
	while ($row = mysql_fetch_array($result)) {
		echo ', { id: '.$row['id'].', visible: true, title: '.json_encode($row['title']).', summary: '.json_encode($row['summary']).', description: '.json_encode($row['description']).' }';
	}
	echo ']}';
} else {
	echo '<response><success>true</success><errcode>0</errcode><message>Layers retrieved successfully.</message><layers>';
	while ($row = mysql_fetch_array($result)) {
		echo '<layer><id>'.$row['id'].'</id><visible>false</visible><title>'.$row['title'].'</title><summary>'.$row['summary'].'</summary><description>'.$row['description'].'</description></layer>';
	}
	echo '</layers></response>';
}

mysql_close($con);
?>
