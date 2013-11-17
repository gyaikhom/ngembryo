<?php
/**
 * Get orientation, layer, and annotation details of models.
 */
include 'login.php';
global $con;

function die_msg($c, $m) {
    die('{e:' . $c . ',m:"' . json_encode($m) . '",d:null}');
}

function die_error($c) {
    die('{e:' . $c . ',m:' . json_encode(mysql_error()) . ',d:null}');
}

$details = array();

function get_annotation_count($type, $id, $u) {
    global $con;
    $sql = "SELECT id FROM $type WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND layer_id=$id";
    if (!($t = mysql_query($sql, $con))) {
        die_error(1);
    }
    return mysql_num_rows($t);
}

/**
 * Get total annotation count.
 */
function get_annotations($ls, $u) {
    global $details;
    foreach ($ls as $t) {
        while ($l = mysql_fetch_array($t)) {
            $details[0] += get_annotation_count("2Dmarker", $l[0], $u);
            $details[1] += get_annotation_count("2Dregion", $l[0], $u);
        }
    }
}

/**
 * Get layer count.
 */
function get_layers($os, $u) {
    global $con, $details;
    $ls = array();
    $c = 0;
    while ($o = mysql_fetch_array($os)) {
        $sql = "SELECT id FROM layer WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND orientation_id=$o[0]";
        if (!($ls[$c] = mysql_query($sql, $con))) {
            die_error(2);
        }
        $details[2] += mysql_num_rows($ls[$c]);
        $c++;
    }
    return $ls;
}

/**
 * Get the orientation count.
 */
function get_orientations($mid, $u) {
    global $con, $details;
    $sql = "SELECT id FROM orientation WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND model_id=$mid";
    if (!($os = mysql_query($sql, $con))) {
        die_error(3);
    }
    $details[3] = mysql_num_rows($os);
    return $os;
}

/**
 * Get model details.
 */
function get_details($mid, $u) {
    $os = get_orientations($mid, $u);
    $ls = get_layers($os, $u);
    get_annotations($ls, $u);
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $mid = $_GET[mid];
    $details[0] = 0;
    $details[1] = 0;
    $details[2] = 0;
    $details[3] = 0;
    get_details($mid, $_SESSION['username']);
    $d = "m:" . $details[0] . ",r:" . $details[1] . ",l:" . $details[2] . ",o:" . $details[3];
    echo '{e:0,m:"Model details retrieved successfully.",d:{' . $d . '}}';
}

mysql_close($con);
?>
