<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Delete layer.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'"}');
}

function echo_success($m) {
	echo '{success: true, errcode: 0, message: "'.$m.'"}';
}

/* Remove all of the marker annotations, on this layer. */
function remove_markers($u, $lid) {
	global $con;
	$sql = "UPDATE 2Dmarker SET deleted_at=NOW() WHERE layer_id=$lid AND owner='$u'";
	if (!mysql_query($sql, $con)) {
		die_error(-1, json_encode(mysql_error()));
	}
}

/* Remove all of the region annotations, on this layer. */
function remove_regions($u, $lid) {
	global $con;
	$sql = "UPDATE 2Dpolyline SET deleted_at=NOW() WHERE 2Dregion_id in (SELECT DISTINCT id FROM 2Dregion WHERE deleted_at IS NULL AND owner='$u' AND layer_id=$lid)";
	if (!mysql_query($sql, $con)) {
		die_error(-2, json_encode(mysql_error()));
	}
	$sql = "UPDATE 2Dregion SET deleted_at=NOW() WHERE layer_id=$lid AND owner='$u'";
	if (!mysql_query($sql, $con)) {
		die_error(-3, json_encode(mysql_error()));
	}
}

/* Remove layer with supplied id. */
function remove_layer($u, $lid) {
	global $con;
	$sql = "UPDATE layer SET deleted_at=NOW() WHERE id=$lid AND owner='$u'";
	if (!mysql_query($sql, $con)) {
		die_error(-4, json_encode(mysql_error()));
	}
	$sql = "SELECT title FROM layer WHERE id=$lid AND owner='$u' LIMIT 1";
	if ($temp = mysql_query($sql, $con)) {
		$row = mysql_fetch_array($temp);
		return $row[0];
	} else {
		die_error(-5, json_encode(mysql_error()));
	}
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$lid = $_GET[lid];
    $user = $_SESSION['username'];

	remove_markers($user, $lid);
	remove_regions($user, $lid);
	$t = remove_layer($user, $lid);
	echo_success("Layer \'$t\' has been deleted.");
}

mysql_close($con);
?>
