<?php

$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('{success: false, errcode: 1, message: "MySQL connection error:'.mysql_error().'", id: 0}');
}

mysql_select_db("ngembryo", $con);

function cleanup($con, $region_id, $reason) {
	$err_msg = mysql_error();

	/* Remove the region which we inserted just now. */
	$sql_remove_region = "DELETE FROM 2Dregion WHERE id = '$region_id'";
	mysql_query($sql_remove_region, $con);

	/* Remove any existing polyline point associated with this region. */
	$sql_remove_region = "DELETE FROM 2Dpolyline WHERE 2Dregion_id = '$region_id'";
	mysql_query($sql_remove_region, $con);

	die('{success: false, errcode: -1, message: "Failed to insert polyline: '.$reason.'", id: 0}');
}

/* Supplied by the client. */
$scale = $_POST[scale];
$label = $_POST[label];
$description = $_POST[description];
$lid = $_POST[lid];
$polyline = $_POST[polyline];

/* Escape quotes etc. */
$label = mysql_escape_string($label);
$description = mysql_escape_string($description);

/* First check if the layer exists. */
$layer = mysql_query("SELECT id FROM layer WHERE id=$lid");
if ($temp = mysql_fetch_array($layer)) {
	$lid = $temp['id'];
} else {
	die('{success: false, errcode: -2, message: "Invalid layer.", id: 0}');
}

/*
 * Parse the polyline before making an insertion.
 */
if (isset($polyline)) {
	$points = explode(':', $polyline);
	if (sizeof($points) < 3) {
		die('{success: false, errcode: -3, message: "At least three points are required to create a region.", id: 0}');
	} else {
		/* Create a 2D region. */
		$sql_insert_region = "INSERT INTO 2Dregion (lid, scale, tl_x, tl_y, br_x, br_y, label, description, created_at) VALUES ('$lid', '$scale', 0, 0, 0, 0, '$label', '$description', NOW())";
		if (!mysql_query($sql_insert_region, $con)) {
			die('{success: false, errcode: 1, message: "MySQL query error:'.mysql_error().'", id: 0}');
		}
		$region_id = mysql_insert_id();

		/* Insert the polyline associated with the 2D region. */
		$tl_x = 0;
		$tl_y = 0;
		$br_x = 0;
		$br_y = 0;
		for ($i = 0; $i < count($points); $i++) {
			$point = explode(',', $points[$i]);
			if (count($point) != 2)
			cleanup($con, $region_id, "invalid point".$points[$i]);
			else {
				$sql_insert_point = "INSERT INTO 2Dpolyline (x, y, 2Dregion_id, rank, created_at) VALUES ('$point[0]', '$point[1]', '$region_id', '$i', NOW())";

				/* If the polyline insertion was unsuccessful, clean up. */
				if (!mysql_query($sql_insert_point, $con))
				cleanup($con, $region_id, "point could not be inserted.");

				/* Update the top-left and bottom-right bounding box. */
				if ($point[0] < $tl_x) $tl_x = $point[0];
				else if ($point[0] > $br_x) $br_x = $point[0];

				if ($point[1] < $tl_y) $tl_y = $point[1];
				else if ($point[1] > $br_y) $br_y = $point[1];
			}
		}

		/* Update the 2D region entry with the correct bounding box coordinates. */
		$sql_update_regionbb = "UPDATE 2Dregion SET tl_x = $tl_x, tl_y = $tl_y, br_x = $br_x, br_y = $br_y WHERE id = $region_id";
		if (!mysql_query($sql_update_regionbb, $con)) {
			cleanup($con, $region_id, "region could not be updated.");
		}
		mysql_close($con);
	}
} else {
	die('{success: false, errcode: -4, message: "Supplied polyline is invalid: '.$reason.'", id: 0}');
}
echo '{success: true, errcode: 0, message: "New 2D region created.", id:'.$region_id.'}';

mysql_close($con);
?>
