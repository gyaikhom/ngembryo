<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", regions: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:'.mysql_error().'</message><regions></regions></response>';
	}
}
mysql_select_db("ngembryo", $con);
$lid = $_GET[lid];

/* First check if the layer exists. */
$layer = mysql_query("SELECT id FROM layer WHERE id=$lid");
if ($temp = mysql_fetch_array($layer)) {
    $lid = $temp['id'];
} else {
   if ($_GET[format] == "json") {
        die('{success: false, errcode: -1, message: "Invalid layer.", regions: null}');
    } else {
        echo '<response><success>false</success><errcode>-1</errcode><message>Invalid layer</message><regions></regions></response>';
    }
}

/* Find all of the regions for this layer. */
$sql = "SELECT * FROM 2Dregion WHERE lid='$lid' AND scale <= '$_GET[scale_high]' AND scale >= '$_GET[scale_low]' AND ((tl_x >= '$_GET[x_low]' AND tl_x <= '$_GET[x_high]' AND tl_y >= '$_GET[y_low]' AND tl_y <= '$_GET[y_high]') OR (br_x >= '$_GET[x_low]' AND br_x <= '$_GET[x_high]' AND br_y >= '$_GET[y_low]' AND br_y <= '$_GET[y_high]') OR (tl_x < '$_GET[x_low]' AND br_x > '$_GET[x_high]' AND ((br_y >= '$_GET[y_low]' AND br_y <= '$_GET[y_high]') OR (tl_y >= '$_GET[y_low]' AND tl_y <= '$_GET[y_high]') OR (tl_y < '$_GET[y_low]' AND br_y > '$_GET[y_high]'))) OR (tl_y < '$_GET[y_low]' AND br_y > '$_GET[y_high]' AND ((br_x >= '$_GET[x_low]' AND br_x <= '$_GET[x_high]') OR (tl_x >= '$_GET[x_low]' AND tl_x <= '$_GET[x_high]') OR (tl_x < '$_GET[x_low]' AND br_x > '$_GET[x_high]'))))";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: "MySQL Query error:'.mysql_error().'", regions: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL Query error:'.mysql_error().'</message><regions></regions></response>';
	}
}

function printRegion($region) {
	echo '{ id: '.$region['id'].', scale: '.$region['scale'].', tl_x: '.$region['tl_x'].', tl_y: '.$region['tl_y'].', br_x: '.$region['br_x'].', br_y: '.$region['br_y'].', label: "'.$region['label'].'", description: "'.$region['description'].'", polyline: ';
	$polyline = mysql_query("SELECT * FROM 2Dpolyline WHERE 2Dregion_id='".$region['id']."' ORDER BY rank ASC");
	if ($point = mysql_fetch_array($polyline)) {
		$count = 1;
		/* echo '[['.$point['x'].','.$point['y'].','.$point['rank'].']'; */
		echo '[{x:'.$point['x'].',y:'.$point['y'].'}';
	}
	while ($point = mysql_fetch_array($polyline)) {
		/* echo ',['.$point['x'].','.$point['y'].','.$point['rank'].']'; */
		echo ',{x:'.$point['x'].',y:'.$point['y'].'}';
		$count++;
	}
	if ($count > 0)
	echo ']';
	echo ' }';
}

if ($_GET[format] == "json") {
	echo '{success: true, errcode: 0, message: "Regions retrieved successfully.", regions: [';
	if ($region = mysql_fetch_array($result))
	printRegion($region);
	while ($region = mysql_fetch_array($result)) {
		echo ',';
		printRegion($region);
	}
	echo ']}';
} else {
	echo '<response><success>true</success><errcode>0</errcode><message>Regions retrieved successfully.</message><regions>';
	while ($row = mysql_fetch_array($result)) {
		echo '<region><id>'.$region['id'].'</id><scale>'.$region['scale'].'</scale><tl_x>'.$region['tl_x'].'</tl_x><tl_y>'.$region['tl_y'].'</tl_y><br_x>'.$region['br_x'].'</br_x><br_y>'.$region['br_y'].'</br_y><label>'.$region['label'].'</label><description>'.$region['description'].'</description><polyline>';
		$polyline = mysql_query("SELECT * FROM 2Dpolyline WHERE 2Dregion_id='".$region['id']."' ORDER BY rank ASC");
		while ($point = mysql_fetch_array($polyline)) {
			echo '<point><x>'.$point['x'].'</x><y>'.$point['y'].'</y><rank>'.$point['rank'].'</rank></point>';
		}
		echo '</polyline></region>';
	}
	echo '</regions></response>';
}

mysql_close($con);
?>
