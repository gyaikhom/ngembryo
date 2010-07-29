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
		$sql = "SELECT * FROM resource WHERE deleted_at IS NULL AND owner='$u'";
		$f = false;
	} else {
		$sql = "SELECT * FROM resource WHERE deleted_at IS NULL AND id=$rid AND owner='$u'";
		$f = true;
	}
	if (($t = mysql_query($sql, $con))) {
	 return $t;
	} else {
		die_error(-1, json_encode(mysql_error()));
	}
}

/* Encode resource. */
function encode_resource($r) {
	global $con;
	$str = '{id:'.$r['id'].',a:'.json_encode($r['author']).',t:'.json_encode($r['title']).',d:'.json_encode($r['abstract']).',l:';
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
	$str = '[';
	if ($r = mysql_fetch_array($rs)) {
		$str .= encode_resource($r);
		while ($r = mysql_fetch_array($rs)) {
			$str .= ','.encode_resource($r);
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
