<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$result = mysql_query("SELECT * FROM 2Dmarker WHERE x >= '$_GET[x_low]' AND x <= '$_GET[x_high]' AND y >= '$_GET[y_low]' AND y <= '$_GET[y_high]' AND scale <= '$_GET[scale_high]' AND scale >= '$_GET[scale_low]'");

if ($_GET[format] == "json") {
    echo '[';
    if ($row = mysql_fetch_array($result))
        echo '{ id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: "'.$row['label'].'", description: "'.$row['description'].'" }';
    while ($row = mysql_fetch_array($result)) {
        echo ', { id: '.$row['id'].', x: '.$row['x'].', y: '.$row['y'].', scale: '.$row['scale'].', label: "'.$row['label'].'", description: "'.$row['description'].'" }';
    }
    echo ']';
} else {
	echo '<2dmarkers>';
    while ($row = mysql_fetch_array($result)) {
        echo '<marker><id>'.$row['id'].'</id><x>'.$row['x'].'</x><y>'.$row['y'].'</y><scale>'.$row['scale'].'</scale><label>'.$row['label'].'</label><description>'.$row['description'].'</description></marker>';
    }
	echo '</2dmarkers>';
}

mysql_close($con);
?>
