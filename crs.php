<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Create a new resource.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", rid: 0}');
}

function echo_success($m, $rid) {
	echo '{success: true, errcode: 0, message: "'.$m.'", rid:'.$rid.'}';
}

/* Check if a resource with the given title and author exists. */
function check_resource($u, $a, $t) {
	global $con;
	$sql = "SELECT id FROM resource WHERE deleted_at IS NULL AND owner='$u' AND author='$a' AND title='$t' LIMIT 1";
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

/* Create a new resource. */
function create_resource($u, $t, $a, $ab) {
	global $con;
	$sql = "INSERT INTO resource (owner, title, author, abstract, created_at) VALUES ('$u', '$t', '$a', '$ab', NOW())";
	if (!mysql_query($sql, $con)) {
		die_error(-2, json_encode(mysql_error()));
	}
	return mysql_insert_id();
}

/* Create a new resource item.
 *
 * NOTE: This is according to the new requirement from April 30 meeting at NCL.
 * We have attempted to minimise changes to the existing database. So, every resource will
 * now have only one resource item. User cannot add new resource items.
 */
function create_resource_item($rid, $t, $a, $l) {
	global $con;
	$sql = "INSERT INTO resourceItem (resource_id, title, abstract, link, created_at) VALUES ('$rid', '$t', '$a', '$l', NOW())";
	if (!mysql_query($sql, $con)) {
		die_error(-3, json_encode(mysql_error()));
	}
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$title = $_POST[title];
	$author = $_POST[author];
	$link = $_POST[link]; /* New requirement: Just a flat list of resources. */
	$abstract = $_POST[description];
	$user = $_SESSION['username'];

	/* Escape quotes etc. */
	$title = return_well_formed($title);
	$author = return_well_formed($author);
	$abstract = return_well_formed($abstract);

	if (check_resource($user, $author, $title)) {
		die_error(-4, "Resource \'$title\' by \'$author\' already exists. No new resource created.");
	} else {
		$rid = create_resource($user, $title, $author, $abstract);
		create_resource_item($rid, $title, $abstract, $link);
		echo_success("New resource \'$title\' has been created.", $rid);
	}
}

mysql_close($con);
?>
