<?php
/**
 * Create a new region annotation.
 */
include 'login.php';
global $user;
global $con;

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '", rid: 0}');
}

function echo_success($m, $rid) {
    echo '{success: true, errcode: 0, message: "' . $m . '", rid:' . $rid . '}';
}

/**
 * In case of failure, remove the region and associated polyline points.
 */
function cleanup($rid, $reason) {
    global $con;

    /* Remove the region which we inserted just now. */
    $sql = "DELETE FROM 2Dregion WHERE deleted_at IS NULL AND id = '$rid'";
    if (!mysql_query($sql, $con)) {
        die_error(-1, json_encode(mysql_error()));
    }

    /* Remove any existing polyline point associated with this region. */
    $sql = "DELETE FROM 2Dpolyline WHERE deleted_at IS NULL AND 2Dregion_id = '$rid'";
    if (!mysql_query($sql, $con)) {
        die_error(-2, json_encode(mysql_error()));
    }

    die_error(-3, "Failed to insert polyline: '$reason'");
}

/**
 * Create a region.
 */
function create_region($u, $lid, $s, $l, $d) {
    global $con;
    $sql = "INSERT INTO 2Dregion (owner, layer_id, scale, tl_x, tl_y, br_x, br_y, label, description, created_at) VALUES ('$u', '$lid', '$s', 0, 0, 0, 0, '$l', '$d', NOW())";
    if (!mysql_query($sql, $con)) {
        die_error(-4, json_encode(mysql_error()));
    }
    return mysql_insert_id();
}

/**
 * Check if a layer with the given id exists.
 */
function check_layer($u, $lid) {
    global $con;
    $sql = "SELECT id FROM layer WHERE deleted_at IS NULL AND owner='$u' AND id=$lid LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            return true;
        } else {
            return false;
        }
    } else {
        die_error(-5, json_encode(mysql_error()));
    }
}

/**
 * Update the 2D region entry with the correct bounding box coordinates.
 */
function update_bbox($rid, $tl_x, $tl_y, $br_x, $br_y) {
    global $con;
    $sql = "UPDATE 2Dregion SET tl_x=$tl_x, tl_y=$tl_y, br_x=$br_x, br_y=$br_y WHERE id=$rid";
    if (!mysql_query($sql, $con)) {
        cleanup($rid, "region could not be updated.");
    }
}

/**
 * Insert the polyline associated with the 2D region.
 */
function insert_polyline($rid, $points) {
    global $con;
    $bbox = array("tl_x" => 999999, "tl_y" => 999999, "br_x" => 0, "br_y" => 0);
    for ($i = 0; $i < count($points); $i++) {
        $point = explode(',', $points[$i]);
        if (count($point) != 2) {
            cleanup($rid, "invalid point" . $points[$i]);
        } else {
            $sql = "INSERT INTO 2Dpolyline (x, y, 2Dregion_id, rank, created_at) VALUES ('$point[0]', '$point[1]', '$rid', '$i', NOW())";

            /* If the polyline insertion was unsuccessful, clean up. */
            if (!mysql_query($sql, $con)) {
                cleanup($rid, "point could not be inserted.");
            }

            /* Update the top-left of  bounding box. */
            if ($point[0] < $bbox["tl_x"]) {
                $bbox["tl_x"] = $point[0];
            } else if ($point[0] > $bbox["br_x"]) {
                $bbox["br_x"] = $point[0];
            }

            /* Update the bottom-right of bounding box. */
            if ($point[1] < $bbox["tl_y"]) {
                $bbox["tl_y"] = $point[1];
            } else if ($point[1] > $bbox["br_y"]) {
                $bbox["br_y"] = $point[1];
            }
        }
    }
    return $bbox;
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {

    /* Supplied by the client. */
    $scale = return_well_formed($_POST[scale]);
    $label = return_well_formed($_POST[label]);
    $description = return_well_formed($_POST[description]);
    $lid = $_POST[lid];
    $polyline = $_POST[polyline];

    if (check_layer($user, $lid)) {
        if (isset($polyline)) {
            $points = explode(':', $polyline);
            if (sizeof($points) < 3) {
                die_error(-6, "At least three points are required to create a region.");
            } else {
                $rid = create_region($user, $lid, $scale, $label, $description);
                $bbox = insert_polyline($rid, $points);
                update_bbox($rid, $bbox["tl_x"], $bbox["tl_y"], $bbox["br_x"], $bbox["br_y"]);
                echo_success("New region \'$label\' has been created.", $rid);
            }
        } else {
            die_error(-7, "Supplied polyline is invalid.");
        }
    } else {
        die_error(-8, "Invalid layer.");
    }
}

mysql_close($con);
?>
