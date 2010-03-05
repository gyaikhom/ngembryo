<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, message: "MySQL connection error:'.mysql_error().'", lid: -1}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$title = $_POST[title];
$summary = $_POST[summary];
$description = $_POST[description];
$oid = $_POST[oid];

/* First check if the orientation exists. */
$orientation = mysql_query("SELECT id FROM orientation WHERE id=$oid");
if ($x = mysql_fetch_array($orientation)) {
	$oid = $x['id'];
} else {
	die('{success: false, message: "Invalid orientation.", lid: -2}');
}

/* Create a new layer using this orientation. */
$sql = "INSERT INTO layer (oid, title, summary, description) VALUES ('$oid', '$title', '$summary', '$description')";
if (!mysql_query($sql, $con)) {
	die('{success: false, message: "MySQL Query error:'.mysql_error().'", lid: -3}');
}
$lid = mysql_insert_id();
echo '{success: true, message: "New layer created.", lid:'.$lid.'}';

mysql_close($con);
?>
