<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', orientations: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>'.mysql_error().'</message><orientations></orientations></response>';
	}
}
mysql_select_db("ngembryo", $con);
$model = $_GET[model];

/* Find all of the orientations for this model. */
$sql = "SELECT * FROM orientation WHERE model_id=$model";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 2, message: '.json_encode(mysql_error()).', orientations: null}');
	} else {
        echo '<response><success>false</success></errcode>2</errcode><message>'.mysql_error().'</message><orientations></orientations></response>';
	}
}

if ($_GET[format] == "json") {
	echo '{success: true, errcode: 0, message: "Orientations retrieved successfully.", orientations: [';
	if ($row = mysql_fetch_array($result)) {
		echo '{ id: '.$row['id'].', title: '.json_encode($row['title']).', description: '.json_encode($row['description']).', yaw: '.$row['yaw'].', pitch: '.$row['pitch'].', roll: '.$row['roll'].', distance: '.$row['distance'].'}';
	}
	while ($row = mysql_fetch_array($result)) {
		echo ', { id: '.$row['id'].', title: '.json_encode($row['title']).', description: '.json_encode($row['description']).', yaw: '.$row['yaw'].', pitch: '.$row['pitch'].', roll: '.$row['roll'].', distance: '.$row['distance'].'}';
	}
	echo ']}';
} else {
	echo '<response><success>true</success><errcode>0</errcode><message>Orientations retrieved successfully.</message><orientations>';
	while ($row = mysql_fetch_array($result)) {
		echo '<orientation><id>'.$row['id'].'</id><title>'.$row['title'].'</title><description>'.$row['description'].'</description><yaw>'.$row['yaw'].'</yaw><pitch>'.$row['pitch'].'</pitch><roll>'.$row['roll'].'</roll><distance>'.$row['distance'].'</distance></orientation>';
	}
	echo '</orientations></response>';
}

mysql_close($con);
?>
