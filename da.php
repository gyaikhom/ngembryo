<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Delete annotation.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'"}');
}

function echo_success($m) {
	echo '{success: true, errcode: 0, message: "'.$m.'"}';
}

/* Delete annotation. */
function delete_annotation($table, $aid) {
	global $con;
	$sql = "UPDATE $table SET deleted_at=NOW() WHERE id=$aid";
	if (!mysql_query($sql, $con)) {
		die_error(-1, json_encode(mysql_error()));
	}
	$sql = "SELECT label FROM $table WHERE id=$aid LIMIT 1";
	if ($temp = mysql_query($sql, $con)) {
		$row = mysql_fetch_array($temp);
		return $row[0];
	} else {
		die_error(-2, json_encode(mysql_error()));
	}
}

/* Unlink resources from the annotation. */
function unlink_annotation_resources($table, $aid) {
	global $con;
	$table = $table.Resource;
	$sql = "UPDATE $table SET deleted_at=NOW() WHERE annotation_id=$aid";
	if (!mysql_query($sql, $con)) {
		die_error(-3, json_encode(mysql_error()));
	}
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$aid = $_GET[aid];
	$type = $_GET[type];
	$table = "";

	if ($type == "m") {
		$table = "2Dmarker";
	} else {
		if ($type == "r") {
			$table = "2Dregion";
		} else {
			die_error(-4, "Unknown annotation type.");
		}
	}
	$t = delete_annotation($table, $aid);
	unlink_annotation_resources($table, $aid);
	echo_success("Annotation \'$t\' has been deleted.");
}

mysql_close($con);
?>
