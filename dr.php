<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Delete resource.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'"}');
}

function echo_success($m) {
	echo '{success: true, errcode: 0, message: "'.$m.'"}';
}

/* Unlink resource from all of the annotations. */
function unlink_from_annotations($rid) {
	global $con;
	$sql = "UPDATE 2DmarkerResource SET deleted_at=NOW() WHERE resource_id=$rid";
	if (!mysql_query($sql, $con)) {
		die_error(-1, json_encode(mysql_error()));
	}
	$sql = "UPDATE 2DregionResource SET deleted_at=NOW() WHERE resource_id=$rid";
	if (!mysql_query($sql, $con)) {
		die_error(-2, json_encode(mysql_error()));
	}
}

/* Remove all of the resource items associated with this resource. */
function remove_resource_items($rid) {
	global $con;
	$sql = "UPDATE resourceItem SET deleted_at=NOW() WHERE resource_id=$rid";
	if (!mysql_query($sql, $con)) {
		die_error(-3, json_encode(mysql_error()));
	}
}

/* Remove resource. */
function remove_resource($rid) {
	global $con;
	$sql = "UPDATE resource SET deleted_at=NOW() WHERE id=$rid";
	if (!mysql_query($sql, $con)) {
		die_error(-4, json_encode(mysql_error()));
	}
	$sql = "SELECT title FROM resource WHERE id=$rid LIMIT 1";
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
	$rid = $_GET[rid];

	unlink_from_annotations($rid);
	remove_resource_items($rid);
	$t = remove_resource($rid);
	echo_success("Resource \'$t\' has been deleted.");
}

mysql_close($con);
?>
