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
	die('{success: false, errcode: '.$c.', message: "'.$m.'",r:{l:null,d:null,m:null,r:null}}');
}

function echo_success($m, $t, $r) {
	echo '{success: true, errcode: 0, message: "'.$m.'",r:{l:'.$t["l"].',d:'.$t["d"].',m:'.$t["m"].',r:'.$r.'}}';
}

/* Check if the annotation exists. */
function check_annotation($u, $table, $aid) {
	global $con;
	$t = array("t" => false, "m" => 0, "l" => "", "d" => "");
	$sql = "SELECT label,description,owner FROM $table WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND id=$aid LIMIT 1";
	if ($temp = mysql_query($sql, $con)) {
		if (mysql_num_rows($temp) > 0) {
			if ($item = mysql_fetch_array($temp)) {
				$t["t"] = true;
				if ($item['owner'] == $u) $t["m"] = 1;
				$t["l"] = json_encode($item['label']);
				$t["d"] = json_encode($item['description']);
			}
		}
		return $t;
	} else {
		die_error(-1, json_encode(mysql_error()));
	}
}

/* Encode resource details. */
function encode_resource($resource) {
	global $con;
	$str = '{id:'.$resource['id'].',a:'.json_encode($resource['author']).',t:'.json_encode($resource['title']).',d:'.json_encode($resource['abstract']).',l:';
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
function get_linked_resources($u, $table, $aid, $exclude) {
	global $con;
	$table = $table."Resource";
	if ($exclude) {
		$sql = "SELECT DISTINCT resource.id, resource.title, resource.author, resource.abstract FROM resource WHERE resource.deleted_at IS NULL AND (owner='$u' OR owner='admin') AND resource.id NOT IN (SELECT DISTINCT resource.id FROM resource LEFT JOIN $table ON $table.resource_id=resource.id WHERE $table.deleted_at IS NULL AND ($table.owner='$u' OR $table.owner='admin') AND $table.annotation_id=$aid)";
	}
	else {
		$sql = "SELECT DISTINCT resource.id, resource.title, resource.author, resource.abstract FROM resource LEFT JOIN $table ON $table.resource_id=resource.id WHERE $table.deleted_at IS NULL AND resource.deleted_at IS NULL AND (resource.owner='$u' OR resource.owner='admin') AND ($table.owner='$u' OR $table.owner='admin') AND $table.annotation_id IS NOT NULL AND $table.annotation_id=$aid";
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
	$user = $_SESSION['username'];

	if ($type == "m") {
		$table = "2Dmarker";
	} else {
		if ($type == "r") {
			$table = "2Dregion";
		} else {
			die_error(-4, "Unknown annotation type.");
		}
	}

	$t = check_annotation($user, $table, $aid);
	if ($t['t']) {
		/**
		 * This is the new version according to the requirement
		 * from April 30, meeting at NCL.
		 * No more resource items. Only a flat list of resources.
		 */
		$res = get_linked_resources($user, $table, $aid, $exclude);
		$json = encode_resources($res);
		echo_success("Resources retrieved successfully.", $t, $json);
	} else {
		die_error(-5, "Invalid annotation.");
	}
}

mysql_close($con);
?>
