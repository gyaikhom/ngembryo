<?php
/**
 * Create a new layer using supplied orientation.
 */
include 'login.php';

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '", lid: 0}');
}

function echo_success($m, $lid) {
    echo '{success: true, errcode: 0, message: "' . $m . '", lid:' . $lid . '}';
}

/**
 * Check if the orientation exists. If yes, return orientation id,
 * otherwise, create a new orientation and return the new id.
 */
function check_create_orientation($u, $m, $y, $p, $r, $d) {
    global $con;
    $sql = "SELECT id FROM orientation WHERE deleted_at IS NULL AND owner='$u' AND model_id='$m' AND yaw='$y' AND pitch='$p' AND roll='$r' AND distance='$d' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            if (($x = mysql_fetch_array($temp))) {
                return $x[0];
            } else {
                die_error(-1, json_encode(mysql_error()));
            }
        } else {
            /* Create a new orientation with supplied values. */
            $sql = "INSERT INTO orientation (owner, model_id, yaw, pitch, roll, distance, created_at) VALUES ('$u', '$m', '$y', '$p', '$r', '$d', NOW())";
            if (!mysql_query($sql, $con)) {
                die_error(-2, json_encode(mysql_error()));
            }
            return mysql_insert_id();
        }
    } else {
        die_error(-3, json_encode(mysql_error()));
    }
}

/**
 * Check if a layer with the given title exists.
 */
function check_layer($u, $oid, $t) {
    global $con;
    $sql = "SELECT id FROM layer WHERE deleted_at IS NULL AND owner='$u' AND orientation_id='$oid' AND title='$t' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            return true;
        } else {
            return false;
        }
    } else {
        die_error(-4, json_encode(mysql_error()));
    }
}

/**
 * Create a new layer using the supplied orientation.
 */
function create_layer($u, $oid, $t, $s, $d) {
    global $con;
    $sql = "INSERT INTO layer (owner, orientation_id, title, summary, description, created_at) VALUES ('$u', '$oid', '$t', '$s', '$d', NOW())";
    if (!mysql_query($sql, $con)) {
        die_error(-5, json_encode(mysql_error()));
    }
    return mysql_insert_id();
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {

    /* Supplied by the client. */
    $title = return_well_formed($_POST[title]);
    $summary = return_well_formed($_POST[summary]);
    $description = return_well_formed($_POST[description]);
    $model = $_POST[model];
    $yaw = $_POST[yaw];
    $pitch = $_POST[pitch];
    $roll = $_POST[roll];
    $distance = $_POST[distance];
    $user = $_SESSION['username'];

    $oid = check_create_orientation($user, $model, $yaw, $pitch, $roll, $distance);
    if (check_layer($user, $oid, $title)) {
        die_error(-6, "Layer \'$title\' already exists. No new layer created.");
    } else {
        $lid = create_layer($user, $oid, $title, $summary, $description);
        echo_success("New layer \'$title\' has been created.", $lid);
    }
}

mysql_close($con);
?>
