<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$result = mysql_query("SELECT * FROM 3Dmarker WHERE x >= '$_GET[x_low]' AND x <= '$_GET[x_high]' AND y >= '$_GET[y_low]' AND y <= '$_GET[y_high]' AND z >= '$_GET[z_low]' AND z <= '$_GET[z_high]'");

if ($_GET[format] == "json") {
    while ($row = mysql_fetch_array($result)) {
        echo '{ id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', z: '.$row['z'].', label: "'.$row['label'].'", description: "'.$row['description'].'" }';
    }
} else {
    while ($row = mysql_fetch_array($result)) {
        echo '<marker><id>'.$row['id'].'</id><x>'.$row['x'].'</x><y>'.$row['y'].'</y><z>'.$row['z'].'</z><label>'.$row['label'].'</label><description>'.$row['description'].'</description></marker>';
    }
}

mysql_close($con);
?>
