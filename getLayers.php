<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$result = mysql_query("SELECT * FROM layer");

if ($_GET[format] == "json") {
    echo '[';
    if ($row = mysql_fetch_array($result))
        echo '{ id: '.$row['id'].', title: '.$row['title'].', summary: '.$row['summary'].', description: '.$row['description'].'" }';
    while ($row = mysql_fetch_array($result)) {
        echo ', { id: '.$row['id'].', title: '.$row['title'].', summary: '.$row['summary'].', description: '.$row['description'].'" }';
    }
    echo ']';
} else {
    echo '<layers>';
    while ($row = mysql_fetch_array($result)) {
        echo '<layer><id>'.$row['id'].'</id>title>'.$row['title'].'</title><summary>'.$row['summary'].'</summary><description>'.$row['description'].'</description></layer>';
    }
    echo '</layers>';
}

mysql_close($con);
?>