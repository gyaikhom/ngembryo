<?php
/**
 * Delete orientation.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '"}');
}

function echo_success($m) {
    echo '{success: true, errcode: 0, message: "' . $m . '"}';
}

/**
 * Remove all of the marker annotations, on all of the layers in this orientation.
 */
function remove_markers($u, $oid) {
    global $con;
    $sql = "UPDATE 2Dmarker SET deleted_at=NOW() WHERE owner='$u' AND layer_id IN (SELECT DISTINCT id from layer WHERE deleted_at IS NULL AND orientation_id=$oid AND owner='$u')";
    if (!mysql_query($sql, $con)) {
        die_error(-1, json_encode(mysql_error()));
    }
}

/**
 * Remove all of the region annotations, on all of the layers in this orientation.
 */
function remove_regions($u, $oid) {
    global $con;
    $sql = "UPDATE 2Dpolyline SET deleted_at=NOW() WHERE 2Dregion_id in (SELECT DISTINCT id FROM 2Dregion WHERE deleted_at IS NULL AND owner='$u' AND layer_id IN (SELECT DISTINCT id from layer WHERE deleted_at IS NULL AND orientation_id=$oid AND owner='$u'))";
    if (!mysql_query($sql, $con)) {
        die_error(-2, json_encode(mysql_error()));
    }
    $sql = "UPDATE 2Dregion SET deleted_at=NOW() WHERE owner='$u' AND layer_id IN (SELECT DISTINCT id from layer WHERE deleted_at IS NULL AND orientation_id=$oid AND owner='$u')";
    if (!mysql_query($sql, $con)) {
        die_error(-3, json_encode(mysql_error()));
    }
}

/**
 * Remove all of the layers in this orientation.
 */
function remove_layers($u, $oid) {
    global $con;
    $sql = "UPDATE layer SET deleted_at=NOW() WHERE orientation_id=$oid AND owner='$u'";
    if (!mysql_query($sql, $con)) {
        die_error(-4, json_encode(mysql_error()));
    }
}

/**
 * Now remove the orientation.
 */
function remove_orientation($u, $oid) {
    global $con;
    $sql = "UPDATE orientation SET deleted_at=NOW() WHERE id=$oid AND owner='$u'";
    if (!mysql_query($sql, $con)) {
        die_error(-5, json_encode(mysql_error()));
    }
    $sql = "SELECT title FROM orientation WHERE id=$oid AND owner='$u' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        $row = mysql_fetch_array($temp);
        return $row[0];
    } else {
        die_error(-6, json_encode(mysql_error()));
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {

    /* Supplied by the client. */
    $oid = $_GET[oid];
    $user = $_SESSION['username'];

    remove_markers($user, $oid);
    remove_regions($user, $oid);
    remove_layers($user, $oid);
    $t = remove_orientation($user, $oid);
    echo_success("Orientation \'$t\' has been deleted.");
}

mysql_close($con);
?>
