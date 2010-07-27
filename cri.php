<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Create a resource item.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", rid: 0}');
}

function echo_success($m, $rid) {
	echo '{success: true, errcode: 0, message: "'.$m.'", rid:'.$rid.'}';
}

/* Check if the resource exists. */
function check_resource($rid) {
	global $con;
	$sql = "SELECT id FROM resource WHERE deleted_at IS NULL AND id='$rid' LIMIT 1";
	if ($temp = mysql_query($sql, $con)) {
		if (mysql_num_rows($temp) > 0) {
			return true;
		} else {
			return false;
		}
	} else {
		die_error(-1, json_encode(mysql_error()));
	}
}

/* Check if a resource item with the given title, mime, and link exists. */
function check_resource_item($rid, $t, $m, $l) {
	global $con;
	$sql = "SELECT id FROM resourceItem WHERE deleted_at IS NULL AND resource_id='$rid' AND title='$t' AND mime='$m' AND link='$l' LIMIT 1";
	if ($temp = mysql_query($sql, $con)) {
		if (mysql_num_rows($temp) > 0) {
			return true;
		} else {
			return false;
		}
	} else {
		die_error(-2, json_encode(mysql_error()));
	}
}

/* Create a new resource item. */
function create_resource_item($rid, $t, $a, $m, $l) {
	$sql = "INSERT INTO resourceItem (resource_id, title, abstract, mime, link, created_at) VALUES ('$rid', '$t', '$a', '$m', '$l', NOW())";
	if (!mysql_query($sql, $con)) {
		die_error(-3, json_encode(mysql_error()));
	}
	return mysql_insert_id();
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$rid = $_POST[rid];
	$title = $_POST[title];
	$abstract = $_POST[description];
	$mime = $_POST[mime];
	$link = $_POST[link];

	/* Escape quotes etc. */
	$title = return_well_formed($title);
	$abstract = return_well_formed($abstract);
	$mime = return_well_formed($mime);
	$link = return_well_formed($link);

	if (check_resource($rid)) {
		if (check_resource_item($rid, $title, $mime, $link)) {
			die_error(-4, "Resource item exists. No new resource item created.");
		} else {
			$rid = create_resource_item($rid, $title, $abstract, $mime, $link);
			echo_success("New resource item has been created.", $rid);
		}
	} else {
		die_error(-5, "Resource does not exists. No new resource item can be created.");
	}
}

mysql_close($con);
?>
