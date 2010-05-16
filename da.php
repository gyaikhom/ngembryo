<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).'}');
}

mysql_select_db("ngembryo", $con);

$aid = $_GET[aid];
$type = $_GET[type];
$table = "";

if ($type == "m") {
	$table = "2Dmarker";
} else {
	if ($type == "r") {
		$table = "2Dregion";
	} else {
		die('{success: false, errcode: 2, message: "Unknown annotation type."}');
	}
}

$sql = "UPDATE $table SET deleted_at=NOW() WHERE id=$aid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -1, message: '.json_encode(mysql_error()).'}');
}

$table = $table.Resource;
$sql = "UPDATE $table SET deleted_at=NOW() WHERE annotation_id=$aid";
if (!mysql_query($sql, $con)) {
	die('{success: false, errcode: -2, message: '.json_encode(mysql_error()).'}');
}

echo '{success: true, errcode: 0, message: "Annotation has been deleted."}';
mysql_close($con);
?>
