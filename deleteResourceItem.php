<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).'}');
}

mysql_select_db("ngembryo", $con);

$rid = $_GET[rid];
$iid = $_GET[iid];
$sql = "UPDATE resourceItem SET deleted_at=NOW() WHERE id=$iid AND resource_id=$rid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

echo '{success: true, errcode: 0, message: "Resource item has been deleted."}';
mysql_close($con);
?>
