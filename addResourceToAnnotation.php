<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', id: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$rid = $_GET[rid];
$aid = $_GET[aid];
$type = $_GET[type];
$table = "";

if ($type == "2dmarker") {
	$table = "2Dmarker";
} else {
	if ($type == "2dregion") {
		$table = "2Dregion";
	} else {
		if ($type == "3dmarker") {
			$table = "3Dmarker";
		} else {
			die('{success: false, errcode: 2, message: "Unknown annotation type.", id: 0}');
		}
	}
}

/* Check if the resource exists. */
$resource = mysql_query("SELECT id FROM resource WHERE id=$rid");
if ($temp = mysql_fetch_array($resource)) {
	$rid = $temp['id'];
} else {
	die('{success: false, errcode: -1, message: "Supplied resource does not exists.", id: 0}');
}

/* Check if the annotation exists. */
$annotation = mysql_query("SELECT id FROM $table WHERE id=$aid");
if ($temp = mysql_fetch_array($annotation)) {
	$aid = $temp['id'];
} else {
	die('{success: false, errcode: -1, message: "Supplied annotation does not exists.", id: 0}');
}

/* Check if the resource is already linked to the annotation. */
$table = $table."Resource";
$already = mysql_query("SELECT id FROM $table WHERE annotation_id=$aid AND resource_id=$rid");
if ($temp = mysql_fetch_array($already)) {
    die('{success: false, errcode: -1, message: "Resource already linked to the annotation.", id: 0}');
}

/* Add resource to annotation */
$sql = "INSERT INTO $table (annotation_id, resource_id, created_at) VALUES ('$aid', '$rid', NOW())";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', id: 0}');
}
$id = mysql_insert_id();
echo '{success: true, errcode: 0, message: "Resource added to annotation.", id:'.$id.'}';

mysql_close($con);
?>
