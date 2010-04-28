<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).'}');
}

mysql_select_db("ngembryo", $con);

$rid = $_GET[rid];

/* Remove the resource from all of the annotations using it. */
$sql = "UPDATE 2DmarkerResource SET deleted_at=NOW() WHERE resource_id=$rid";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}
$sql = "UPDATE 2DregionResource SET deleted_at=NOW() WHERE resource_id=$rid";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* First remove all of the resource items associated with this resource. */
$sql = "UPDATE resourceItem SET deleted_at=NOW() WHERE resource_id=$rid";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

/* Now remove the resource. */
$sql = "UPDATE resource SET deleted_at=NOW() WHERE id=$rid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

echo '{success: true, errcode: 0, message: "Resource has been deleted."}';
mysql_close($con);
?>
