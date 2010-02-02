<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    print('Could not connect: '.mysql_error());
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$sql = "INSERT INTO 2Dmarker (x, y, scale, dst, yaw, rol, pit, label, description) VALUES ('$_POST[x]', '$_POST[y]', '$_POST[scale]', '$_POST[dst]', '$_POST[yaw]', '$_POST[rol]', '$_POST[pit]', '$_POST[label]', '$_POST[description]')";

if (!mysql_query($sql, $con)) {
    print('Error: '.mysql_error());
    die('Error: '.mysql_error());
}

mysql_close($con);

print("Successfully added new 2D marker at (".'$_POST[x]'.", ".'$_POST[y]'.")");
?>
