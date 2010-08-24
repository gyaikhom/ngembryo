<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Get resources.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success:false,errcode:'.$c.',message:"'.$m.'",r:null}');
}

function echo_success($m, $r) {
	echo '{success:true,errcode:0,message:"'.$m.'",r:'.$r.'}';
}

/* Find the resources. */
function find_resources($u, $rid) {
	global $con;
	$f = false;
	if ($rid == "") {
		$sql = "SELECT * FROM resource WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin')";
		$f = false;
	} else {
		$sql = "SELECT * FROM resource WHERE deleted_at IS NULL AND id=$rid AND (owner='$u' OR owner='admin')";
		$f = true;
	}
	if (($t = mysql_query($sql, $con))) {
	 return $t;
	} else {
		die_error(-1, json_encode(mysql_error()));
	}
}

/* Encode resource. */
function encode_resource($r, $u) {
	global $con;
    $q = 0;
    if ($r['owner'] == $u) $q = 1;
	
	$str = '{id:'.$r['id'].',m:'.$q.',a:'.json_encode($r['author']).',t:'.json_encode($r['title']).',d:'.json_encode($r['abstract']).',l:';
	$sql = "SELECT link FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$r['id']."' LIMIT 1";
	if (($t = mysql_query($sql, $con))) {
		if ($i = mysql_fetch_array($t)) {
			$str .= json_encode($i[0]).'}';
		} else {
			$str .= 'null}';
		}
	} else {
		die_error(-1, json_encode(mysql_error()));
	}
	return $str;
}

/* Encode resources. */
function encode_resources($rs) {
	$u = $_SESSION['username'];
	$str = '[';
	if ($r = mysql_fetch_array($rs)) {
		$str .= encode_resource($r, $u);
		while ($r = mysql_fetch_array($rs)) {
			$str .= ','.encode_resource($r, $u);
		}
	}
	return $str.']';
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$rid = $_GET['rid'];
	$user = $_SESSION['username'];

	$rs = find_resources($user, $rid);
	$json = encode_resources($rs);
	echo_success("Resources retrieved successfully.", $json);
}

mysql_close($con);
?>
