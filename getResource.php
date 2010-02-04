<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

mysql_select_db("ngembryo", $con);

$table = "2DmarkerResource";
if ($_GET[type] == "2dregion") {
    $table = "2DregionResource";
} else {
    if ($_GET[type] == "3dmarker") {
        $table = "3DmarkerResource";
    }
}

$result = mysql_query("SELECT * FROM $table WHERE aid=$_GET[id]");

if ($_GET[format] == "json") {
    echo '[';
    if ($resource = mysql_fetch_array($result)) {
        $rid = $resource['rid'];
        $temp = mysql_query("SELECT * FROM resource WHERE id=$rid");
        $detail = mysql_fetch_array($temp);
        echo '{ id: '.$detail['id'].', title: "'.$detail['title'].'", summary: "'.$detail['abstract'].'", url: "'.$detail['url'].'"}';
    }
    while ($resource = mysql_fetch_array($result)) {
        $rid = $resource['rid'];
        $temp = mysql_query("SELECT * FROM resource WHERE id=$rid");
        $detail = mysql_fetch_array($temp);
        echo ', { id: '.$detail['id'].', title: "'.$detail['title'].'", summary: "'.$detail['abstract'].'", url: "'.$detail['url'].'"}';
    }
    echo ']';
} else {
    if ($_GET[format] == "csv") {
    	print('id,'.'title,'.'abstract,'.'url'."\n");
        while ($resource = mysql_fetch_array($result)) {
            $rid = $resource['rid'];
            $temp = mysql_query("SELECT * FROM resource WHERE id=$rid");
            $detail = mysql_fetch_array($temp);
            print($detail['id'].',"'.$detail['title'].'","'.$detail['abstract'].'","'.$detail['url'].'"'."\n");
        }    	
    } else {
        echo '<resourcelist>';
        while ($resource = mysql_fetch_array($result)) {
            $rid = $resource['rid'];
            $temp = mysql_query("SELECT * FROM resource WHERE id=$rid");
            $detail = mysql_fetch_array($temp);
            echo '<resource><id>'.$detail['id'].'</id><title>'.$detail['title'].'</title><abstract>'.$detail['abstract'].'</abstract><url>'.$detail['url'].'</url></resource>';
        }
        echo '</resourcelist>';
    }
}

mysql_close($con);
?>
