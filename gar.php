<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Get annotation resources.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", r: null}');
}

function echo_success($m, $r) {
	echo '{success: true, errcode: 0, message: "'.$m.'", r: '.$r.'}';
}

/* Check if the annotation exists. */
function check_annotation($table, $aid) {
	global $con;
	$sql = "SELECT id FROM $table WHERE deleted_at IS NULL AND id=$aid LIMIT 1";
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

/* Encode resource details. */
function encode_resource($resource) {
	global $con;
	$str = '{i:'.$resource['id'].',a:'.json_encode($resource['author']).',t:'.json_encode($resource['title']).',d:'.json_encode($resource['abstract']).',l:';
	$sql = "SELECT * FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$resource['id']."' LIMIT 1";
	if ($temp = mysql_query($sql, $con)) {
		if ($item = mysql_fetch_array($temp)) {
			$str = $str.json_encode($item['link']);
		} else {
			$str = $str.'null';
		}
	} else {
		die_error(-2, json_encode(mysql_error()));
	}
	$str = $str.'}';
	return $str;
}

/* Encode resources. */
function encode_resources($resources) {
	$str = "[";
	if ($resource = mysql_fetch_array($resources))
	$str = $str.encode_resource($resource);
	while ($resource = mysql_fetch_array($resources)) {
		$str = $str.',';
		$str = $str.encode_resource($resource);
	}
	$str = $str.']';
	return $str;
}

/* Get all of the resources linked (or not linked) to this annotation. */
function get_linked_resources($table, $aid, $exclude) {
	global $con;
	$table = $table."Resource";
	if ($exclude) {
		$sql = "SELECT DISTINCT resource.id, resource.title, resource.author, resource.abstract FROM resource WHERE resource.deleted_at IS NULL AND resource.id NOT IN (SELECT DISTINCT resource.id FROM resource LEFT JOIN $table ON $table.resource_id=resource.id WHERE resource.deleted_at IS NULL AND $table.annotation_id=$aid)";
	}
	else {
		$sql = "SELECT DISTINCT resource.id, resource.title, resource.author, resource.abstract FROM resource LEFT JOIN $table ON $table.resource_id=resource.id WHERE resource.deleted_at IS NULL AND $table.annotation_id IS NOT NULL AND $table.annotation_id=$aid";
	}
	if (($temp = mysql_query($sql, $con))) {
		return $temp;
	} else {
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
	$exclude = $_GET[exclude];
	$format = $_GET[format];
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

	if (check_annotation($table, $aid)) {
		/**
		 * This is the new version according to the requirement
		 * from April 30, meeting at NCL.
		 * No more resource items. Only a flat list of resources.
		 */
		$res = get_linked_resources($table, $aid, $exclude);
		$json = encode_resources($res);
		echo_success("Resources retrieved successfully.", $json);
	} else {
		die_error(-5, "Invalid annotation.");
	}
}

mysql_close($con);
?>
