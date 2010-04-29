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

echo '{success: true, errcode: 0, message: "Orientation has been deleted."}';
mysql_close($con);
?>
