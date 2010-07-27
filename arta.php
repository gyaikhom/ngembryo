<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Add resource to annotation.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", id: 0}');
}

function echo_success($m, $id) {
	echo '{success: true, errcode: 0, message: "'.$m.'", id:'.$id.'}';
}

/* Check if the resource exists. */
function check_resource($rid) {
	global $con;
	$sql = "SELECT id FROM resource WHERE deleted_at IS NULL AND id=$rid LIMIT 1";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(-1, json_encode(mysql_error()));
	}
	if (mysql_num_rows($temp) > 0) {
		return true;
	} else {
		return false;
	}
}

/* Check if the annotation exists. */
function check_annotation($table, $aid) {
	global $con;
	$sql = "SELECT id FROM $table WHERE deleted_at IS NULL AND id=$aid LIMIT 1";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(-2, json_encode(mysql_error()));
	}
	if (mysql_num_rows($temp) > 0) {
		return true;
	} else {
		return false;
	}
}

/* Check if the resource is already linked to the annotation. */
function check_linked($table, $aid, $rid) {
	global $con;
	$sql = "SELECT id FROM $table WHERE deleted_at IS NULL AND annotation_id=$aid AND resource_id=$rid LIMIT 1";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(-3, json_encode(mysql_error()));
	}
	if (mysql_num_rows($temp) > 0) {
		return true;
	} else {
		return false;
	}
}

/* Add resource to annotation */
function link_resource_to_annotation($table, $aid, $rid) {
	global $con;
	$sql = "INSERT INTO $table (annotation_id, resource_id, created_at) VALUES ('$aid', '$rid', NOW())";
	if (!mysql_query($sql, $con)) {
		die_error(-4, json_encode(mysql_error()));
	}
	return mysql_insert_id();
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$rid = $_GET[rid];
	$aid = $_GET[aid];
	$type = $_GET[type];
	$table = "";

	if ($type == "m") {
		$table = "2Dmarker";
	} else {
		if ($type == "r") {
			$table = "2Dregion";
		} else {
			die_error(1, "Unknown annotation type.");
		}
	}

	if (check_resource($rid)) {
		if (check_annotation($table, $aid)) {
			$table = $table."Resource";
			if (!check_linked($table, $aid, $rid)) {
				$id = link_resource_to_annotation($table, $aid, $rid);
				echo_success("Resource added to annotation.", $id);
			} else {
				die_error(2, "Resource already linked to the annotation.");
			}
		} else {
			die_error(3, "Supplied annotation does not exists.");
		}
	} else {
		die_error(4, "Supplied resource does not exists.");
	}
}

mysql_close($con);
?>
