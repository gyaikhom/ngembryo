<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).'}');
}

mysql_select_db("ngembryo", $con);

$lid = $_GET[lid];

/* Remove all of the marker annotations, on this layer. */
$sql = "UPDATE 2Dmarker SET deleted_at=NOW() WHERE layer_id=$lid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* Remove all of the region annotations, on this layer. */
$sql = "UPDATE 2Dpolyline SET deleted_at=NOW() WHERE 2Dregion_id in (SELECT DISTINCT id FROM 2Dregion WHERE deleted_at IS NULL AND layer_id=$lid)";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}
$sql = "UPDATE 2Dregion SET deleted_at=NOW() WHERE layer_id=$lid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* Now remove the layer. */
$sql = "UPDATE layer SET deleted_at=NOW() WHERE id=$lid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

$sql = "SELECT title FROM layer WHERE id=$lid";
if ($result = mysql_query($sql, $con)) {
	if ($row = mysql_fetch_array($result)) {
		echo '{success: true, errcode: 0, message: "Layer \''.$row['title'].'\' has been deleted."}';
	} else {
		echo '{success: true, errcode: 0, message: "Layer has been deleted."}';
	}
} else {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}
mysql_close($con);
?>
