<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$sql = "INSERT INTO 3Dmarker (x, y, z, scale, label, description) VALUES ('$_POST[x]', '$_POST[y]', '$_POST[z]', '$_POST[scale]', '$_POST[label]', '$_POST[description]')";
	
if (!mysql_query($sql, $con)) {
    die('Error: '.mysql_error());
}

mysql_close($con);
?>
