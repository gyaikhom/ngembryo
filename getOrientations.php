<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, message: "MySQL connection error:'.mysql_error().'", orientations: null}');
	} else {
		echo '<response><success>false</success><message>MySQL connection error:'.mysql_error().'</message><orientations></orientations></response>';
	}
}
mysql_select_db("ngembryo", $con);
$model = $_GET[model];

/* Find all of the orientations for this model. */
$sql = "SELECT * FROM orientation WHERE mid=$model";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, message: "MySQL Query error:'.mysql_error().'", orientations: null}');
	} else {
        echo '<response><success>false</success><message>MySQL Query error:'.mysql_error().'</message><orientations></orientations></response>';
	}
}

if ($_GET[format] == "json") {
	echo '{success: true, message: "Orientations retrieved successfully.", orientations: [';
	if ($row = mysql_fetch_array($result)) {
		echo '{ id: '.$row['id'].', title: "'.$row['title'].'", summary: "'.$row['summary'].'", description: "'.$row['description'].'", yaw: '.$row['yaw'].', pitch: '.$row['pitch'].', roll: '.$row['roll'].', distance: '.$row['distance'].'}';
	}
	while ($row = mysql_fetch_array($result)) {
		echo ', { id: '.$row['id'].', title: "'.$row['title'].'", summary: "'.$row['summary'].'", description: "'.$row['description'].'", yaw: '.$row['yaw'].', pitch: '.$row['pitch'].', roll: '.$row['roll'].', distance: '.$row['distance'].'}';
	}
	echo ']}';
} else {
	echo '<response><success>true</success><message>Orientations retrieved successfully.</message><orientations>';
	while ($row = mysql_fetch_array($result)) {
		echo '<orientation><id>'.$row['id'].'</id><yaw>'.$row['yaw'].'</yaw><pitch>'.$row['pitch'].'</pitch><roll>'.$row['roll'].'</roll><distance>'.$row['distance'].'</distance></orientation>';
	}
	echo '</orientations></response>';
}

mysql_close($con);
?>
