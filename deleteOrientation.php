<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).'}');
}

mysql_select_db("ngembryo", $con);

$oid = $_GET[oid];

/* Remove all of the marker annotations, on all of the layers in this orientation. */
$sql = "UPDATE 2Dmarker SET deleted_at=NOW() WHERE layer_id IN (SELECT DISTINCT id from layer WHERE orientation_id=$oid)";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* Remove all of the region annotations, on all of the layers in this orientation. */
$sql = "UPDATE 2Dpolyline SET deleted_at=NOW() WHERE 2Dregion_id in (SELECT DISTINCT id FROM 2Dregion WHERE layer_id IN (SELECT DISTINCT id from layer WHERE orientation_id=$oid))";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}
$sql = "UPDATE 2Dregion SET deleted_at=NOW() WHERE layer_id IN (SELECT DISTINCT id from layer WHERE orientation_id=$oid)";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* Remove all of the layers in this orientation. */
$sql = "UPDATE layer SET deleted_at=NOW() WHERE orientation_id=$oid";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* Now remove the orientation. */
$sql = "UPDATE orientation SET deleted_at=NOW() WHERE id=$oid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

echo '{success: true, errcode: 0, message: "Orientation has been deleted."}';
mysql_close($con);
?>
