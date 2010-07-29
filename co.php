<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Create a new orientation.
 */

include 'login.php';

function die_error($c, $m) {
	die('{success: false, errcode: '.$c.', message: "'.$m.'", oid: 0}');
}

function echo_success($m, $oid) {
	echo '{success: true, errcode: 0, message: "'.$m.'", oid:'.$oid.'}';
}

/* Check if the orientation exists. */
function check_orientation($u, $m, $y, $p, $r, $d) {
	global $con;
	$sql = "SELECT id FROM orientation WHERE deleted_at IS NULL AND owner='$u' AND model_id=$m AND yaw=$y AND pitch=$p AND roll=$r AND distance=$d LIMIT 1";
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

/* Create a new orientation with parameters supplied by the user. */
function create_orientation($u, $m, $t, $d, $y, $p, $r, $d) {
	global $con;
	$sql = "INSERT INTO orientation (owner, model_id, title, description, yaw, pitch, roll, distance, created_at) VALUES ('$u', '$m', '$t', '$d', '$y', '$p', '$r', '$d', NOW())";
	if (!mysql_query($sql, $con)) {
		die_error(-2, json_encode(mysql_error()));
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
	$model = $_POST[model];
	$yaw = $_POST[yaw];
	$pitch = $_POST[pitch];
	$roll = $_POST[roll];
	$distance = $_POST[distance];
	$user = $_SESSION['username'];

	/* Escape quotes etc. */
	$title = return_well_formed($title);
	$description = return_well_formed($description);

	if (check_orientation($user, $model, $yaw, $pitch, $roll, $distance)) {
		die_error(-3, "Orientation already exists with title \'$title\'. No new orientation created.");
	} else {
		$oid = create_orientation($user, $model, $title, $description, $yaw, $pitch, $roll, $distance);
		echo_success("Orientation \'$title\' has been created.", $oid);
	}
}

mysql_close($con);
?>
