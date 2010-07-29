<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Search facility.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", n: null, r: null}');
}

function count_matches($u, $key) {
	global $con;
	$nfound = array();

	$sql = "SELECT DISTINCT id FROM 2Dmarker WHERE deleted_at IS NULL AND owner='$u' AND (label like '%$key%' OR description like '%$key%')";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(2, json_encode(mysql_error()));
	}
	$nfound[0] = mysql_num_rows($temp);

	$sql = "SELECT DISTINCT id FROM 2Dregion WHERE deleted_at IS NULL AND owner='$u' AND (label like '%$key%' OR description like '%$key%')";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(3, json_encode(mysql_error()));
	}
	$nfound[1] = mysql_num_rows($temp);

	$sql = "SELECT DISTINCT id FROM layer WHERE deleted_at IS NULL AND owner='$u' AND (title like '%$key%' OR summary like '%$key%' OR description like '%$key%')";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(4, json_encode(mysql_error()));
	}
	$nfound[2] = mysql_num_rows($temp);

	$sql = "SELECT DISTINCT id FROM resource WHERE deleted_at IS NULL AND owner='$u' AND (title like '%$key%' OR abstract like '%$key%' OR author like '%$key%')";
	if (!($temp = mysql_query($sql, $con))) {
		die_error(5, json_encode(mysql_error()));
	}
	$nfound[3] = mysql_num_rows($temp);
	return $nfound;
}

function get_mid($orientation) {
	global $con;
	$sql = "SELECT model_id FROM orientation WHERE deleted_at IS NULL AND id='".$orientation."' LIMIT 1";
	if ($foo = mysql_query($sql, $con)) {
		if ($temp = mysql_fetch_array($foo)) {
			return $temp[0];
		} else {
			die_error(6, json_encode(mysql_error()));
		}
	} else {
		die_error(7, json_encode(mysql_error()));
	}
}

function get_oid($layer) {
	global $con;
	$sql = "SELECT orientation_id FROM layer WHERE deleted_at IS NULL AND id='".$layer."' LIMIT 1";
	if ($foo = mysql_query($sql, $con)) {
		if ($temp = mysql_fetch_array($foo)) {
			return $temp[0];
		} else {
			die_error(8, json_encode(mysql_error()));
		}
	} else {
		die_error(9, json_encode(mysql_error()));
	}
}

function get_link($i) {
	global $con;
	$sql = "SELECT link FROM resourceItem WHERE deleted_at IS NULL AND resource_id='".$i."' LIMIT 1";
	if ($ri = mysql_query($sql, $con)) {
		if (mysql_num_rows($ri) > 0) {
			if ($ln = mysql_fetch_array($ri)) {
				return json_encode($ln[0]);
			} else {
				die_error(11, $i.json_encode(mysql_error()));
			}
		} else {
			return "\"\"";
		}
	} else {
		die_error(12, json_encode(mysql_error()));
	}
}


function find_markers($u, $key, $start, $limit) {
	global $con;
	$sql = "SELECT DISTINCT id,layer_id,scale,label,description FROM 2Dmarker WHERE deleted_at IS NULL AND owner='$u' AND (label like '%$key%' OR description like '%$key%') LIMIT $start,$limit";
	if ($markers = mysql_query($sql, $con)) {
		return $markers;
	} else {
		die_error(10, json_encode(mysql_error()));
	}
}

function find_regions($u, $key, $start, $limit) {
	global $con;
	$sql = "SELECT DISTINCT id,layer_id,scale,label,description FROM 2Dregion WHERE deleted_at IS NULL AND owner='$u' AND (label like '%$key%' OR description like '%$key%') LIMIT $start,$limit";
	if (!($regions = mysql_query($sql, $con))) {
		return null;
	}
	return $regions;
}

function find_layers($u, $key, $start, $limit) {
	global $con;
	$sql = "SELECT DISTINCT id,orientation_id,title,description FROM layer WHERE deleted_at IS NULL AND owner='$u' AND (title like '%$key%' OR summary like '%$key%' OR description like '%$key%') LIMIT $start,$limit";
	if (!($layers = mysql_query($sql, $con))) {
		return null;
	}
	return $layers;
}

function find_resources($u, $key, $start, $limit) {
	global $con;
	$sql = "SELECT DISTINCT id,author,title,abstract FROM resource WHERE deleted_at IS NULL AND owner='$u' AND (title like '%$key%' OR abstract like '%$key%' OR author like '%$key%') LIMIT $start,$limit";
	if (!($resources = mysql_query($sql, $con))) {
		return null;
	}
	return $resources;
}

function expand_marker_region($t) {
	$l = $t['layer_id'];
	$o = get_oid($l);
	$m = get_mid($o);
	return "{i:".$t['id'].",s:".$t['scale'].",t:".json_encode($t['label']).",d:".json_encode($t['description']).",l:".$l.",o:".$o.",m:".$m."}";
}

function expand_layer($t) {
	$o = $t['orientation_id'];
	$m = get_mid($o);
	return "{i:".$t['id'].",s:0,t:".json_encode($t['title']).",d:".json_encode($t['description']).",l:".$t['id'].",o:".$o.",m:".$m."}";
}

function expand_resource($t) {
	$l = get_link($t['id']);
	return "{i:".$t['id'].",a:".json_encode($t['author']).",t:".json_encode($t['title']).",d:".json_encode($t['abstract']).",l:".$l."}";
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {
	$key = $_GET[key];
	$type = $_GET[type];
	$start = $_GET[start];
	$limit = $_GET[limit];
	$user = $_SESSION['username'];

	if (strlen($key) == 0) {
		die_error(1, "Please supply a search keyword.");
	}
	if (!$start) $start = 0;
	if (!$limit) $limit = 10;
	if (!$type) $type = 0;

	$nfound = count_matches($user, $key);

	switch($type) {
		case 0:
			if ($nfound[0] > 0) {
				$markers = find_markers($user, $key, $start, $limit);
				$result = "[";
				if ($m = mysql_fetch_array($markers))
				$result .= expand_marker_region($m);
				while ($m = mysql_fetch_array($markers)) {
					$result .= ",".expand_marker_region($m);
				}
				$result .= "]";
			} else {
				$result = "[]";
			}
			break;

		case 1:
			if ($nfound[1] > 0) {
				$regions = find_regions($user, $key, $start, $limit);
				$result = "[";
				if ($r = mysql_fetch_array($regions))
				$result .= expand_marker_region($r);
				while ($r = mysql_fetch_array($regions)) {
					$result .= ",".expand_marker_region($r);
				}
				$result .= "]";
			} else {
				$result = "[]";
			}
			break;

		case 2:
			if ($nfound[2] > 0) {
				$layers = find_layers($user, $key, $start, $limit);
				$result = "[";
				if ($r = mysql_fetch_array($layers))
				$result .= expand_layer($r);
				while ($r = mysql_fetch_array($layers)) {
					$result .= ",".expand_layer($r);
				}
				$result .= "]";
			} else {
				$result = "[]";
			}
			break;

		case 3:
			if ($nfound[3] > 0) {
				$resources = find_resources($user, $key, $start, $limit);
				$result = "[";
				if ($r = mysql_fetch_array($resources))
				$result .= expand_resource($r);
				while ($r = mysql_fetch_array($resources)) {
					$result .= ",".expand_resource($r);
				}
				$result .= "]";
			} else {
				$result = "[]";
			}
			break;
	}

	$found = "{m:".$nfound[0].",r:".$nfound[1].",l:".$nfound[2].",rs:".$nfound[3]."}";
	echo '{success:true,errcode:0,message:"Search was successful.",t:'.$type.',n:'.$found.',r:'.$result.'}';
}

mysql_close($con);

?>
