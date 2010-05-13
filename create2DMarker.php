<?php

include 'utils.php';

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', id: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$x = $_POST[x];
$y = $_POST[y];
$scale = $_POST[scale];
$label = $_POST[label];
$description = $_POST[description];
$lid = $_POST[lid];

/* Escape quotes etc. */
$label = return_well_formed($label);
$description = return_well_formed($description);

/* First check if the layer exists. */
$layer = mysql_query("SELECT id FROM layer WHERE deleted_at IS NULL AND id=$lid");
if ($temp = mysql_fetch_array($layer)) {
    $lid = $temp['id'];
} else {
    die('{success: false, errcode: -1, message: "Invalid layer.", id: 0}');
}

/* Create a new 2D marker using this layer. */
$sql = "INSERT INTO 2Dmarker (layer_id, x, y, scale, label, description, created_at) VALUES ('$lid', '$x', '$y', '$scale', '$label', '$description', NOW())";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', id: 0}');
}
$id = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New 2D marker created.", id:'.$id.'}';

mysql_close($con);
?>
