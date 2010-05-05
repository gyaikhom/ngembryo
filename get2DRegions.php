<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', regions: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:'.mysql_error().'</message><regions></regions></response>';
	}
}
mysql_select_db("ngembryo", $con);
$lid = $_GET[lid];

/* First check if the layer exists. */
$layer = mysql_query("SELECT id FROM layer WHERE deleted_at IS NULL AND id=$lid");
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
$sql = "SELECT * FROM 2Dregion WHERE deleted_at IS NULL AND layer_id='$lid' AND scale <= '$_GET[scale_high]' AND scale >= '$_GET[scale_low]' AND ((tl_x >= '$_GET[x_low]' AND tl_x <= '$_GET[x_high]' AND tl_y >= '$_GET[y_low]' AND tl_y <= '$_GET[y_high]') OR (br_x >= '$_GET[x_low]' AND br_x <= '$_GET[x_high]' AND br_y >= '$_GET[y_low]' AND br_y <= '$_GET[y_high]') OR (tl_x < '$_GET[x_low]' AND br_x > '$_GET[x_high]' AND ((br_y >= '$_GET[y_low]' AND br_y <= '$_GET[y_high]') OR (tl_y >= '$_GET[y_low]' AND tl_y <= '$_GET[y_high]') OR (tl_y < '$_GET[y_low]' AND br_y > '$_GET[y_high]'))) OR (tl_y < '$_GET[y_low]' AND br_y > '$_GET[y_high]' AND ((br_x >= '$_GET[x_low]' AND br_x <= '$_GET[x_high]') OR (tl_x >= '$_GET[x_low]' AND tl_x <= '$_GET[x_high]') OR (tl_x < '$_GET[x_low]' AND br_x > '$_GET[x_high]'))))";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', regions: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL Query error:'.mysql_error().'</message><regions></regions></response>';
	}
}

/**
 * This is the new version according to the requirement from April 30, meeting at NCL.
 * No more resource items. Only a flat list of resources.
 */
function listResources($aid) {
	echo ', resources: { count: ';
	$count = mysql_query("SELECT DISTINCT COUNT(*) FROM resource LEFT JOIN 2DregionResource ON 2DregionResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DregionResource.annotation_id IS NOT NULL AND 2DregionResource.annotation_id=$aid");
	if ($temp = mysql_fetch_array($count)) {
		echo $temp['COUNT(*)'];
	} else {
		echo '0';
	}

	echo ', resources: [';
	$resources = mysql_query("SELECT DISTINCT resource.title, resource.author FROM resource LEFT JOIN 2DregionResource ON 2DregionResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DregionResource.annotation_id IS NOT NULL AND 2DregionResource.annotation_id=$aid LIMIT 5");
	if ($resource = mysql_fetch_array($resources)) {
		echo "{ title: ".json_encode($resource['title']).", author: ".json_encode($resource['author'])."}";
	}
	while ($resource = mysql_fetch_array($resources)) {
		echo ", { title: ".json_encode($resource['title']).", author: ".json_encode($resource['author'])."}";
	}
	echo ']}';
}

function printRegion($region) {
	echo '{ id: '.$region['id'].', scale: '.$region['scale'].', tl_x: '.$region['tl_x'].', tl_y: '.$region['tl_y'].', br_x: '.$region['br_x'].', br_y: '.$region['br_y'].', label: '.json_encode($region['label']).', description: '.json_encode($region['description']);
	listResources($region['id']);
	echo ', polyline: ';
	$polyline = mysql_query("SELECT * FROM 2Dpolyline WHERE deleted_at IS NULL AND 2Dregion_id='".$region['id']."' ORDER BY rank ASC");
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
		$polyline = mysql_query("SELECT * FROM 2Dpolyline WHERE deleted_at IS NULL AND 2Dregion_id='".$region['id']."' ORDER BY rank ASC");
		while ($point = mysql_fetch_array($polyline)) {
			echo '<point><x>'.$point['x'].'</x><y>'.$point['y'].'</y><rank>'.$point['rank'].'</rank></point>';
		}
		echo '</polyline></region>';
	}
	echo '</regions></response>';
}

mysql_close($con);
?>
