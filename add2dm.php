<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$aid = $_POST[aid];
$lid = $_POST[lid];

$sql = "INSERT INTO layer2Dmarker (aid, lid) VALUES ('$aid', '$lid')";	
if (!mysql_query($sql, $con)) {
    die('Error: '.mysql_error());
}

mysql_close($con);
?>
