<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$sql = "INSERT INTO resource (title, abstract, url) VALUES ('$_POST[title]', '$_POST[abstract]', '$_POST[url]')";
	
if (!mysql_query($sql, $con)) {
    die('Error: '.mysql_error());
}

mysql_close($con);
?>
