<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', resources: null}');
}

mysql_select_db("ngembryo", $con);

$key = $_GET[key];
$type = $_GET[type];
$start = $_GET[start];
$limit = $_GET[limit];

if (!$start)
$start = 0;
switch($type) {
	case "marker":
		$sql = "SELECT DISTINCT id,label,description FROM 2Dmarker WHERE deleted_at IS NULL AND (label like '%$key%' OR description like '%$key%') LIMIT $start,$limit";
		if (!($markers = mysql_query($sql, $con))) {
			die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', results: null}');
		}
		echo '{success: true, errcode: 0, message: "Search was successful.", type:3, results: [';
		if ($temp = mysql_fetch_array($markers))
		echo "{i:".$temp['id'].",t:".json_encode($temp['label']).",d:".json_encode($temp['description'])."}";
		while ($temp = mysql_fetch_array($markers)) {
			echo ",{i:".$temp['id'].",t:".json_encode($temp['label']).",d:".json_encode($temp['description'])."}";
		}
		echo ']}';
		break;

	case "region":
		$sql = "SELECT DISTINCT id,label,description FROM 2Dregion WHERE deleted_at IS NULL AND (label like '%$key%' OR description like '%$key%') LIMIT $start,$limit";
		if (!($regions = mysql_query($sql, $con))) {
			die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', results: null}');
		}
		echo '{success: true, errcode: 0, message: "Search was successful.", type:4, results: [';
		if ($temp = mysql_fetch_array($regions))
		echo "{i:".$temp['id'].",t:".json_encode($temp['label']).",d:".json_encode($temp['description'])."}";
		while ($temp = mysql_fetch_array($regions)) {
			echo ",{i:".$temp['id'].",t:".json_encode($temp['label']).",d:".json_encode($temp['description'])."}";
		}
		echo ']}';

		break;

	case "layer":
		$sql = "SELECT DISTINCT id,title,description FROM layer WHERE deleted_at IS NULL AND (title like '%$key%' OR summary like '%$key%' OR description like '%$key%') LIMIT $start,$limit";
		if (!($layers = mysql_query($sql, $con))) {
			die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', results: null}');
		}
		echo '{success: true, errcode: 0, message: "Search was successful.", type:2, results: [';
		if ($temp = mysql_fetch_array($layers))
		echo "{i:".$temp['id'].",t:".json_encode($temp['title']).",d:".json_encode($temp['description'])."}";
		while ($temp = mysql_fetch_array($layers)) {
			echo ",{i:".$temp['id'].",t:".json_encode($temp['title']).",d:".json_encode($temp['description'])."}";
		}
		echo ']}';

		break;

	case "resource":
		$sql = "SELECT DISTINCT id,author,title,abstract FROM resource WHERE deleted_at IS NULL AND (title like '%$key%' OR abstract like '%$key%' OR author like '%$key%') LIMIT $start,$limit";
		if (!($resources = mysql_query($sql, $con))) {
			die('{success: false, errcode: 1, message: '.json_encode(mysql_error()).', results: null}');
		}
		echo '{success: true, errcode: 0, message: "Search was successful.", type:1, results: [';
		if ($temp = mysql_fetch_array($resources))
		echo "{i:".$temp['id'].",a:".json_encode($temp['author']).",t:".json_encode($temp['title']).",d:".json_encode($temp['abstract'])."}";
		while ($temp = mysql_fetch_array($resources)) {
			echo ",{i:".$temp['id'].",a:".json_encode($temp['author']).",t:".json_encode($temp['title']).",d:".json_encode($temp['abstract'])."}";
		}
		echo ']}';

		break;
}

mysql_close($con);

?>
