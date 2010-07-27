<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Create a new model.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", mid: 0}');
}

function echo_success($m, $mid) {
	echo '{success: true, errcode: 0, message: "'.$m.'", mid:'.$mid.'}';
}

/* Check if models with the supplied details already exists. */
function check_model($title, $description, $stack, $server, $webpath, $fspath, $initialdst, $assayid, $imgtitle, $external, $tileframe, $locator, $sectionplane, $sp_src, $sp_inc, $sp_numpit, $sp_numyaw, $sp_title, $sp_bgcolor) {
	global $con;
	$sql = "SELECT id FROM model WHERE deleted_at IS NULL AND title='$title' AND description='$description' AND stack='$stack' AND server='$server' AND webpath='$webpath' AND fspath='$fspath' AND initialdst='$initialdst' AND assayid='$assayid' AND imgtitle='$imgtitle' AND external='$external' AND tileframe='$tileframe' AND locator='$locator' AND sectionplane='$sectionplane' AND sp_src='$sp_src' AND sp_inc='$sp_inc' AND sp_numpit='$sp_numpit' AND sp_numyaw='$sp_numyaw' AND sp_title='$sp_title' AND sp_bgcolor='$sp_bgcolor' LIMIT 1";
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

/* Create a new model. */
function create_model($title, $description, $stack, $server, $webpath, $fspath, $initialdst, $assayid, $imgtitle, $external, $tileframe, $locator, $sectionplane, $sp_src, $sp_inc, $sp_numpit, $sp_numyaw, $sp_title, $sp_bgcolor) {
	global $con;
	$sql = "INSERT INTO model (title, description, stack, server, webpath, fspath, initialdst, assayid, imgtitle, external, tileframe, locator, sectionplane, sp_src, sp_inc, sp_numpit, sp_numyaw, sp_title, sp_bgcolor, created_at) VALUES ('$title', '$description', '$stack', '$server', '$webpath', '$fspath', '$initialdst', '$assayid', '$imgtitle', '$external', '$tileframe', '$locator', '$sectionplane', '$sp_src', '$sp_inc', '$sp_numpit', '$sp_numyaw', '$sp_title', '$sp_bgcolor', NOW())";
	if (!mysql_query($sql, $con)) {
		die_error(-2,  json_encode(mysql_error()));
	}
	return mysql_insert_id();
}

$logged_in = checkLogin();
if (!$logged_in) {
	header('Location: ngembryo.php');
} else {

	/* Supplied by the client. */
	$title = $_POST[title];
	$description = $_POST[description];
	$stack = $_POST[stack];
	$server = $_POST[server];
	$webpath = $_POST[webpath];
	$fspath = $_POST[fspath];
	$initialdst = $_POST[initialdst];
	$assayid = $_POST[assayid];
	$imgtitle = $_POST[imgtitle];
	$external = $_POST[external];
	$tileframe = $_POST[tileframe];
	$locator = $_POST[locator];
	$sectionplane = $_POST[sectionplane];
	$sp_src = $_POST[spsrc];
	$sp_inc = $_POST[spinc];
	$sp_numpit = $_POST[sppit];
	$sp_numyaw = $_POST[spyaw];
	$sp_title = $_POST[sptitle];
	$sp_bgcolor = $_POST[spbgcolor];

	if (check_model($title, $description, $stack, $server, $webpath, $fspath, $initialdst, $assayid, $imgtitle, $external, $tileframe, $locator, $sectionplane, $sp_src, $sp_inc, $sp_numpit, $sp_numyaw, $sp_title, $sp_bgcolor)) {
        die_error(-3, "Model \'$title\' already exists. No new model created.");
	} else {
        $mid = create_model($title, $description, $stack, $server, $webpath, $fspath, $initialdst, $assayid, $imgtitle, $external, $tileframe, $locator, $sectionplane, $sp_src, $sp_inc, $sp_numpit, $sp_numyaw, $sp_title, $sp_bgcolor);
        echo_success("New model \'$title\' has been created.", $mid)
	}
}

mysql_close($con);
?>
