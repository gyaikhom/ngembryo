<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', markers: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:'.mysql_error().'</message><markers></markers></response>';
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
		die('{success: false, errcode: -1, message: "Invalid layer.", markers: null}');
	} else {
		echo '<response><success>false</success><errcode>-1</errcode><message>Invalid layer</message><markers></markers></response>';
	}
}

/* Find all of the markers for this layer. */
$sql = "SELECT * FROM 2Dmarker WHERE deleted_at IS NULL AND layer_id=$lid AND x >= '$_GET[x_low]' AND x <= '$_GET[x_high]' AND y >= '$_GET[y_low]' AND y <= '$_GET[y_high]' AND scale <= '$_GET[scale_high]' AND scale >= '$_GET[scale_low]'";
if (!($result = mysql_query($sql, $con))) {
	if ($_GET[format] == "json") {
		die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', markers: null}');
	} else {
		echo '<response><success>false</success><errcode>1</errcode><message>MySQL Query error:'.mysql_error().'</message><markers></markers></response>';
	}
}

/**
 * This is the new version according to the requirement from April 30, meeting at NCL.
 * No more resource items. Only a flat list of resources.
 */
function listResources($aid) {
    echo ', resources: { count: ';
	$count = mysql_query("SELECT DISTINCT COUNT(*) FROM resource LEFT JOIN 2DmarkerResource ON 2DmarkerResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DmarkerResource.annotation_id IS NOT NULL AND 2DmarkerResource.annotation_id=$aid");
    if ($temp = mysql_fetch_array($count)) {
    	echo $temp['COUNT(*)'];
    } else {
    	echo '0';
    }
    echo ', resources: [';
	$resources = mysql_query("SELECT DISTINCT resource.title, resource.author FROM resource LEFT JOIN 2DmarkerResource ON 2DmarkerResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DmarkerResource.annotation_id IS NOT NULL AND 2DmarkerResource.annotation_id=$aid LIMIT 5");
	if ($resource = mysql_fetch_array($resources)) {
		echo "{ title: ".json_encode($resource['title']).", author: ".json_encode($resource['author'])."}";
	}
	while ($resource = mysql_fetch_array($resources)) {
		echo ", { title: ".json_encode($resource['title']).", author: ".json_encode($resource['author'])."}";
	}
	echo ']}}';
}

if ($_GET[format] == "json") {
	echo '{success: true, errcode: 0, message: "Markers retrieved successfully.", markers: [';
	if ($row = mysql_fetch_array($result)) {
		echo '{ id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: '.json_encode($row['label']).', description: '.json_encode($row['description']);
		listResources($row['id']);
	}

	/**
	 * Old version.
	 *
	 echo '{ id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: '.json_encode($row['label']).', description: '.json_encode($row['description']).' }';
	 while ($row = mysql_fetch_array($result)) {
		echo ', { id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: '.json_encode($row['label']).', description: '.json_encode($row['description']).' }';
		}
		echo ']}';*/

	while ($row = mysql_fetch_array($result)) {
		echo ', { id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: '.json_encode($row['label']).', description: '.json_encode($row['description']);
		listResources($row['id']);
	}
	echo ']}';

} else {
	echo '<response><success>true</success><errcode>0</errcode><message>Markers retrieved successfully.</message><markers>';
	while ($row = mysql_fetch_array($result)) {
		echo '<marker><id>'.$row['id'].'</id><x>'.$row['x'].'</x><y>'.$row['y'].'</y><scale>'.$row['scale'].'</scale><label>'.$row['label'].'</label><description>'.$row['description'].'</description></marker>';
	}
	echo '</markers></response>';
}
mysql_close($con);
?>
