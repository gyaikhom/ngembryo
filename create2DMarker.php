<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('{success: false, message: "MySQL connection error:'.mysql_error().'", id: -1}');
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
if ($x = mysql_fetch_array($layer)) {
    $lid = $x['id'];
} else {
    die('{success: false, message: "Invalid layer.", id: -2}');
}

/* Create a new 2D marker using this layer. */
$sql = "INSERT INTO 2Dmarker (lid, x, y, scale, label, description) VALUES ('$lid', '$x', '$y', '$scale', '$label', '$description')";
if (!mysql_query($sql, $con)) {
    die('{success: false, message: "MySQL Query error:'.mysql_error().'", id: -3}');
}
$id = mysql_insert_id();
echo '{success: true, message: "New 2D marker created.", id:'.$id.'}';

mysql_close($con);
?>
