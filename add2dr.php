<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$sql = "INSERT INTO Layer2Dregion (aid, lid) VALUES ('$_POST[aid]', '$_POST[lid]')";
	
if (!mysql_query($sql, $con)) {
    die('Error: '.mysql_error());
}

mysql_close($con);
?>
