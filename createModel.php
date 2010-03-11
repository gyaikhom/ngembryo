<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

/* Supplied by the client. */
$title = $_POST[title];
$description = $_POST[description];
$stack = $_POST[stack];
$server = $_POST[server];
$webpath = $_POST[webpath];
$fspath = $_POST[fspath];
$initialdst = $_POST[initialdst];
$assayid = $_POST[assayid];
$imgtitle = $_POST[imgtitle];
$external = $_POST[external];
$tileframe = $_POST[tileframe];
$locator = $_POST[locator];
$sectionplane = $_POST[sectionplane];
$sp_src = $_POST[spsrc];
$sp_inc = $_POST[spinc];
$sp_numpit = $_POST[sppit];
$sp_numyaw = $_POST[spyaw];
$sp_title = $_POST[sptitle];
$sp_bgcolor = $_POST[spbgcolor];

$sql = "INSERT INTO model (title, description, stack, server, webpath, fspath, initialdst, assayid, imgtitle, external, tileframe, locator, sectionplane, sp_src, sp_inc, sp_numpit, sp_numyaw, sp_title, sp_bgcolor, created_at) VALUES ('$title', '$description', '$stack', '$server', '$webpath', '$fspath', '$initialdst', '$assayid', '$imgtitle', '$external', '$tileframe', '$locator', '$sectionplane', '$sp_src', '$sp_inc', '$sp_numpit', '$sp_numyaw', '$sp_title', '$sp_bgcolor', NOW())";
if (!mysql_query($sql, $con)) {
	die('Error: '.mysql_error());
}

mysql_close($con);
?>
