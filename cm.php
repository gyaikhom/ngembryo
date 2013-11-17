<?php
/**
 * Create a new marker on supplied layer using supplied details.
 */
include 'login.php';

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '", id: 0}');
}

function echo_success($m, $id) {
    echo '{success: true, errcode: 0, message: "' . $m . '", id:' . $id . '}';
}

/* Check if a layer with the given id exists. */

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
        die_error(-1, json_encode(mysql_error()));
    }
}

/* Create a new marker on the supplied layer using the supplied details. */

function create_marker($u, $lid, $x, $y, $s, $l, $d) {
    global $con;
    $sql = "INSERT INTO 2Dmarker (owner, layer_id, x, y, scale, label, description, created_at) VALUES ('$u', '$lid', '$x', '$y', '$s', '$l', '$d', NOW())";
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
    $x = $_POST[x];
    $y = $_POST[y];
    $scale = $_POST[scale];
    $label = return_well_formed($_POST[label]);
    $description = return_well_formed($_POST[description]);
    $lid = $_POST[lid];
    $user = $_SESSION['username'];

    if (check_layer($user, $lid)) {
        $id = create_marker($user, $lid, $x, $y, $scale, $label, $description);
        echo_success("New marker \'$label\' has been created.", $id);
    } else {
        die_error(-3, "Invalid layer.");
    }
}

mysql_close($con);
?>
