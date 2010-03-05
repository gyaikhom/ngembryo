<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, message: "MySQL connection error:'.mysql_error().'", markers: null}');
	} else {
		echo '<response><success>false</success><message>MySQL connection error:'.mysql_error().'</message><markers></markers></response>';
	}
}
mysql_select_db("ngembryo", $con);
$lid = $_GET[lid];

/* First check if the layer exists. */
$layer = mysql_query("SELECT id FROM layer WHERE id=$lid");
if ($x = mysql_fetch_array($layer)) {
    $lid = $x['id'];
} else {
    die('{success: false, message: "Invalid layer.", markers: null}');
}

/* Find all of the markers for this layer. */
$sql = "SELECT * FROM 2Dmarker WHERE lid=$lid AND x >= '$_GET[x_low]' AND x <= '$_GET[x_high]' AND y >= '$_GET[y_low]' AND y <= '$_GET[y_high]' AND scale <= '$_GET[scale_high]' AND scale >= '$_GET[scale_low]'";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, message: "MySQL Query error:'.mysql_error().'", markers: null}');
	} else {
		echo '<response><success>false</success><message>MySQL Query error:'.mysql_error().'</message><markers></markers></response>';
	}
}

if ($_GET[format] == "json") {
	echo '{success: true, message: "Markers retrieved successfully.", markers: [';
	if ($row = mysql_fetch_array($result))
	echo '{ id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: "'.$row['label'].'", description: "'.$row['description'].'" }';
	while ($row = mysql_fetch_array($result)) {
		echo ', { id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: "'.$row['label'].'", description: "'.$row['description'].'" }';
	}
	echo ']}';
} else {
	echo '<response><success>true</success><message>Markers retrieved successfully.</message><markers>';
	while ($row = mysql_fetch_array($result)) {
		echo '<marker><id>'.$row['id'].'</id><x>'.$row['x'].'</x><y>'.$row['y'].'</y><scale>'.$row['scale'].'</scale><label>'.$row['label'].'</label><description>'.$row['description'].'</description></marker>';
	}
	echo '</markers></response>';
}

mysql_close($con);
?>
