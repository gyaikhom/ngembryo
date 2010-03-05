<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    if ($_GET[format] == "json") {
        die('{success: false, message: "MySQL connection error:'.mysql_error().'", layers: null}');
    } else {
        echo '<response><success>false</success><message>MySQL connection error:'.mysql_error().'</message><layers></layers></response>';
    }
}
mysql_select_db("ngembryo", $con);
$oid = $_GET[oid];

/* Find all of the layers for this orientation. */
$sql = "SELECT * FROM layer WHERE oid=$oid";
if (!($result = mysql_query($sql, $con))) {
    if ($_GET[format] == "json") {
        die('{success: false, message: "MySQL Query error:'.mysql_error().'", layers: null}');
    } else {
        echo '<response><success>false</success><message>MySQL Query error:'.mysql_error().'</message><layers></layers></response>';
    }
}

if ($_GET[format] == "json") {
    echo '{success: true, message: "Layers retrieved successfully.", orientations: [';
    if ($row = mysql_fetch_array($result)) {
        echo '{ id: '.$row['id'].', title: "'.$row['title'].'", summary: "'.$row['summary'].'", description: "'.$row['description'].'" }';
    }
    while ($row = mysql_fetch_array($result)) {
    	echo ', { id: '.$row['id'].', title: "'.$row['title'].'", summary: "'.$row['summary'].'", description: "'.$row['description'].'" }';
    }
    echo ']}';
} else {
    echo '<response><success>true</success><message>Layers retrieved successfully.</message><layers>';
    while ($row = mysql_fetch_array($result)) {
        echo '<layer><id>'.$row['id'].'</id>title>'.$row['title'].'</title><summary>'.$row['summary'].'</summary><description>'.$row['description'].'</description></layer>';
    }
    echo '</layers></response>';
}

mysql_close($con);
?>
