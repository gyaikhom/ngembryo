<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Get orientation, layer, and annotation details of models.
 */
include 'login.php';

function die_msg($c, $m) {
	die('{e:'.$c.',m:"'.json_encode($m).'",d:null}');
}

function die_error($c) {
	die('{e:'.$c.',m:'.json_encode(mysql_error()).',d:null}');
}

$details = array();

/* Get annotation count. */
function get_annotation_count($type, $id) {
	global $con;
	$sql = "SELECT id FROM $type WHERE deleted_at IS NULL AND layer_id=$id";
	if (!($t = mysql_query($sql, $con))) {
		die_error(1);
	}
	return mysql_num_rows($t);
}

/* Get total annotation count. */
function get_annotations($ls) {
	global $con, $details;
	foreach ($ls as $t) {
		while ($l = mysql_fetch_array($t)) {
			$details[0] += get_annotation_count("2Dmarker", $l[0]);
			$details[1] += get_annotation_count("2Dregion", $l[0]);
		}
	}
}

/* Get layer count. */
function get_layers($os) {
	global $con, $details;
	$ls = array();
	$c = 0;
	while ($o = mysql_fetch_array($os)) {
		$sql = "SELECT id FROM layer WHERE deleted_at IS NULL AND orientation_id=$o[0]";
		if (!($ls[$c] = mysql_query($sql, $con))) {
			die_error(2);
		}
		$details[2] += mysql_num_rows($ls[$c]);
		$c++;
	}
	return $ls;
}

/* Get the orientation count. */
function get_orientations($mid) {
	global $con, $details;
	$sql = "SELECT id FROM orientation WHERE deleted_at IS NULL AND model_id=$mid";
	if (!($os = mysql_query($sql, $con))) {
		die_error(3);
	}
	$details[3] = mysql_num_rows($os);
	return $os;
}

/* Get model details. */
function get_details($mid) {
	$os = get_orientations($mid);
	$ls = get_layers($os);
	get_annotations($ls);
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {
	$mid = $_GET[mid];
	$details[0] = 0;
	$details[1] = 0;
	$details[2] = 0;
	$details[3] = 0;
	get_details($mid);
	$d = "m:".$details[0].",r:".$details[1].",l:".$details[2].",o:".$details[3];
	echo '{e:0,m:"Model details retrieved successfully.",d:{'.$d.'}}';
}

mysql_close($con);

?>
