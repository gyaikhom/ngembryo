<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", id: 0}');
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$x = $_POST[x];
$y = $_POST[y];
$scale = $_POST[scale];
$label = $_POST[label];
$description = $_POST[description];
$lid = $_POST[lid];

/* First check if the layer exists. */
$layer = mysql_query("SELECT id FROM layer WHERE id=$lid");
if ($temp = mysql_fetch_array($layer)) {
    $lid = $temp['id'];
} else {
    die('{success: false, errcode: -1, message: "Invalid layer.", id: 0}');
}

/* Create a new 2D marker using this layer. */
$sql = "INSERT INTO 2Dmarker (lid, x, y, scale, label, description) VALUES ('$lid', '$x', '$y', '$scale', '$label', '$description')";
if (!mysql_query($sql, $con)) {
    die('{success: false, errcode: 1, message: "MySQL Query error:'.mysql_error().'", id: 0}');
}
$id = mysql_insert_id();
echo '{success: true, errcode: 0, message: "New 2D marker created.", id:'.$id.'}';

mysql_close($con);
?>
