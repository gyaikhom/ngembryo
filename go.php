<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Get orientations.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success:false,errcode:'.$c.',message:"'.$m.'",o:null}');
}

function echo_success($m, $o) {
	echo '{success:true,errcode:0,message:"'.$m.'",o:'.$o.'}';
}

/* Find all of the orientations for this model. */
function find_orientation($u, $mid) {
	global $con;
	$sql = "SELECT * FROM orientation WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND model_id=$mid";
	if (($t = mysql_query($sql, $con))) {
		return $t;
	} else {
		die_error(-1, json_encode(mysql_error()));
	}
}

/* Encode orientation. */
function encode_orientation($o, $u) {
	$m = 0;
	if ($o['owner'] == $u) $m = 1;
	return '{id:'.$o['id'].',m:'.$m.',t:'.json_encode($o['title']).',d:'.json_encode($o['description']).',y:'.$o['yaw'].',p:'.$o['pitch'].',r:'.$o['roll'].',ds:'.$o['distance'].'}';
}

/* Encode orientations. */
function encode_orientations($os) {
	$u = $_SESSION['username'];
	$str = '[';
	if ($o = mysql_fetch_array($os)) {
		$str .= encode_orientation($o, $u);
		while ($o = mysql_fetch_array($os)) {
			$str .= ','.encode_orientation($o, $u);
		}
	}
	return $str.']';
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$model = $_GET[model];
	$user = $_SESSION['username'];

	$os = find_orientation($user, $model);
	$json = encode_orientations($os);
	echo_success("Orientations retrieved successfully.", $json);
}

mysql_close($con);
?>
