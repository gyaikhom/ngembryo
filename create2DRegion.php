<?php 
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    die('Could not connect: '.mysql_error());
}

function cleanup($con, $region_id, $reason) {
    $err_msg = mysql_error();
    
    /* Remove the region which we inserted just now. */
    $sql_remove_region = "DELETE FROM 2Dregion WHERE id = '$region_id'";
    mysql_query($sql_remove_region, $con);
    
    /* Remove any existing polyline point associated with this region. */
    $sql_remove_region = "DELETE FROM 2Dpolyline WHERE 2Dregion_id = '$region_id'";
    mysql_query($sql_remove_region, $con);
    
    die('Cleanup ['.$reason.'] '.$err_msg);
}

/*
 * Parse the polyline before making an insertion.
 */
$polyline = $_POST[polyline];

if (isset($polyline)) {
    $points = explode(':', $polyline);
    if (sizeof($points) < 3) {
        echo "At least three points are required to create a region.";
    } else {
        mysql_select_db("ngembryo", $con);
        
        /* Create a 2D region. */
        $sql_insert_region = "INSERT INTO 2Dregion (scale, dst, yaw, rol, pit, tl_x, tl_y, br_x, br_y, label, description) VALUES ('$_POST[scale]', '$_POST[dst]', '$_POST[yaw]', '$_POST[rol]', '$_POST[pit]', 0, 0, 0, 0, '$_POST[label]', '$_POST[description]')";
        if (!mysql_query($sql_insert_region, $con)) {
            die('Insert region: '.mysql_error());
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
                cleanup($con, $region_id, "Invalid point".$points[$i]);
            else {
                $sql_insert_point = "INSERT INTO 2Dpolyline (x, y, 2Dregion_id, rank) VALUES ('$point[0]', '$point[1]', '$region_id', '$i')";
                
                /* If the polyline insertion was unsuccessful, clean up. */
                if (!mysql_query($sql_insert_point, $con))
                    cleanup($con, $region_id, "Failed to insert point.");
					
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
            die('Update region bounding box: '.mysql_error());
        }
		
        mysql_close($con);
    }
} else {
    echo "Invalid polyline.";
}

?>
