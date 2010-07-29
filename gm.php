<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Get markers and resources.
 *
 * NOTE: This is the new version according to the requirement from April 30,
 * meeting at NCL. No more resource items. Only a flat list of resources.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success:false,errcode:'.$c.',message:"'.$m.'",m:null}');
}

function echo_success($m, $r) {
	echo '{success:true,errcode:0,message:"'.$m.'",m:'.$r.'}';
}

/* Check if a layer with the given id exists. */
function check_layer($lid) {
	global $con;
	$sql = "SELECT id FROM layer WHERE deleted_at IS NULL AND id=$lid LIMIT 1";
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

/* Find all of the markers for this layer. */
function find_markers($lid, $xl, $xh, $yl, $yh, $sl, $sh) {
	global $con;
	$sql = "SELECT * FROM 2Dmarker WHERE deleted_at IS NULL AND layer_id=$lid AND x >= '$xl' AND x <= '$xh' AND y >= '$yl' AND y <= '$yh' AND scale <= '$sh' AND scale >= '$sl'";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(-2, json_encode(mysql_error()));
	}
	return $temp;
}

/* Get number of resources connected to this marker. */
function get_resources_count($aid) {
	global $con;
	$sql = "SELECT DISTINCT resource.id FROM resource LEFT JOIN 2DmarkerResource ON 2DmarkerResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DmarkerResource.annotation_id IS NOT NULL AND 2DmarkerResource.annotation_id=$aid";
	if (($temp = mysql_query($sql, $con))) {
		return mysql_num_rows($temp);
	} else {
		die_error(-3, json_encode(mysql_error()));
	}
}

/* Encode resource. */
function encode_resource($r) {
	return "{t:".json_encode($r['title']).",a:".json_encode($r['author'])."}";
}


/* Get resources. */
function get_resources($aid) {
	global $con;
	$sql = "SELECT DISTINCT resource.id, resource.title, resource.author FROM resource LEFT JOIN 2DmarkerResource ON 2DmarkerResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DmarkerResource.annotation_id IS NOT NULL AND 2DmarkerResource.annotation_id=$aid LIMIT 5";
	if (($t = mysql_query($sql, $con))) {
		if ($r = mysql_fetch_array($t)) {
			$str = '['.encode_resource($r);
		}
		while ($r = mysql_fetch_array($t)) {
			$str .= ','.encode_resource($r);
		}
		$str .= ']';
		return $str;
	} else {
		die_error(-4, json_encode(mysql_error()));
	}
}

/* Encode marker. */
function encode_marker($m) {
	$str =  '{id:'.$m['id'].',x:'.$m['x'].',y:'.$m['y'].',s:'.$m['scale'].',l:'.json_encode($m['label']).',d:'.json_encode($m['description']);
	$aid = $m['id'];
	if (($c = get_resources_count($aid)) > 0) {
		$str .= ',r:{c:'.$c.',r:'.get_resources($aid).'}}';
	} else {
		$str .= ',r:{c:0,r:null}}';
	}
	return $str;
}

/* Encode markers and resources. */
function encode_markers($mkrs) {
	$str = "[";

	if ($m = mysql_fetch_array($mkrs)) {
		$str .= encode_marker($m);
	}
	while ($m = mysql_fetch_array($mkrs)) {
		$str .= ','.encode_marker($m);
	}
	$str .= ']';
	return $str;
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$lid = $_GET[lid];
	$xl = $_GET[x_low];
	$xh = $_GET[x_high];
	$yl = $_GET[y_low];
	$yh = $_GET[y_high];
	$sl = $_GET[scale_low];
	$sh = $_GET[scale_high];

	if (check_layer($lid)) {
		$mkrs = find_markers($lid, $xl, $xh, $yl, $yh, $sl, $sh);
		$json = encode_markers($mkrs);
	} else {
		die_error(-5, "Invalid layer.");
	}
	echo_success("Markers retrieved successfully.", $json);
}

mysql_close($con);
?>
