<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Get regions and resources.
 *
 * NOTE: This is the new version according to the requirement from April 30,
 * meeting at NCL. No more resource items. Only a flat list of resources.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success:false,errcode:'.$c.',message:"'.$m.'",r:null}');
}

function echo_success($m, $r) {
	echo '{success:true,errcode:0,message:"'.$m.'",r:'.$r.'}';
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

/* Find all of the regions for this layer. */
function find_regions($lid, $xl, $xh, $yl, $yh, $sl, $sh) {
	global $con;
	$sql = "SELECT * FROM 2Dregion WHERE deleted_at IS NULL AND layer_id='$lid' AND scale <= '$sh' AND scale >= '$sl' AND ((tl_x >= '$xl' AND tl_x <= '$xh' AND tl_y >= '$yl' AND tl_y <= '$yh') OR (br_x >= '$xl' AND br_x <= '$xh' AND br_y >= '$yl' AND br_y <= '$yh') OR (tl_x < '$xl' AND br_x > '$xh' AND ((br_y >= '$yl' AND br_y <= '$yh') OR (tl_y >= '$yl' AND tl_y <= '$yh') OR (tl_y < '$yl' AND br_y > '$yh'))) OR (tl_y < '$yl' AND br_y > '$yh' AND ((br_x >= '$xl' AND br_x <= '$xh') OR (tl_x >= '$xl' AND tl_x <= '$xh') OR (tl_x < '$xl' AND br_x > '$xh'))))";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(-2, json_encode(mysql_error()));
	}
	return $temp;
}

/* Get number of resources connected to this region. */
function get_resources_count($aid) {
	global $con;
	$sql = "SELECT DISTINCT resource.id FROM resource LEFT JOIN 2DregionResource ON 2DregionResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DregionResource.annotation_id IS NOT NULL AND 2DregionResource.annotation_id=$aid";
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
	$sql = "SELECT DISTINCT resource.id, resource.title, resource.author FROM resource LEFT JOIN 2DregionResource ON 2DregionResource.resource_id=resource.id WHERE resource.deleted_at IS NULL AND 2DregionResource.annotation_id IS NOT NULL AND 2DregionResource.annotation_id=$aid LIMIT 5";
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

/* Encode point. */
function encode_point($p) {
	return '{x:'.$p['x'].',y:'.$p['y'].'}';
}

/* Encode polyline. */
function encode_polyline($aid) {
	global $con;
	$str = '[';
	$sql = "SELECT * FROM 2Dpolyline WHERE deleted_at IS NULL AND 2Dregion_id=$aid ORDER BY rank ASC";
	if (($t = mysql_query($sql, $con))) {
		if ($p = mysql_fetch_array($t)) {
			$str .= encode_point($p);
		}
		while ($p = mysql_fetch_array($t)) {
			$str .= ','.encode_point($p);
		}
	} else {
		die_error(-4, json_encode(mysql_error()));
	}
	$str .= ']';
	return $str;

}

/* Encode region. */
function encode_region($r) {
	$str =  '{id:'.$r['id'].',s:'.$r['scale'].',l:'.json_encode($r['label']).',d:'.json_encode($r['description']);
	$aid = $r['id'];
	$str .= ',p:'.encode_polyline($aid);
	if (($c = get_resources_count($aid)) > 0) {
		$str .= ',r:{c:'.$c.',r:'.get_resources($aid).'}}';
	} else {
		$str .= ',r:{c:0,r:null}}';
	}
	return $str;
}

/* Encode regions and resources. */
function encode_regions($rgs) {
	$str = "[";

	if ($r = mysql_fetch_array($rgs)) {
		$str .= encode_region($r);
	}
	while ($r = mysql_fetch_array($rgs)) {
		$str .= ','.encode_region($r);
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
		$rgs = find_regions($lid, $xl, $xh, $yl, $yh, $sl, $sh);
		$json = encode_regions($rgs);
	} else {
		die_error(-5, "Invalid layer.");
	}
	echo_success("Regions retrieved successfully.", $json);
}

mysql_close($con);
?>
