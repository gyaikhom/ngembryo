<?php
/**
 * Save changes to layer details.
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
 * Check if a layer with the given title exists.
 */
function check_layer($u, $t, $lid) {
    global $con;
    $sql = "SELECT id FROM layer WHERE deleted_at IS NULL AND owner='$u' AND title='$t' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            if (($k = mysql_fetch_array($temp))) {
                if ($k[0] == $lid) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return false;
        }
    } else {
        die_error(-1, json_encode(mysql_error()));
    }
}

function update_layer($t, $d, $lid) {
    global $con;
    $sql = "UPDATE layer SET title='$t',description='$d',updated_at=NOW() WHERE id=$lid";
    if (!mysql_query($sql, $con)) {
        die_error(-2, json_encode(mysql_error()));
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $lid = $_POST[lid];
    $title = return_well_formed($_POST[title]);
    $description = return_well_formed($_POST[description]);
    $user = $_SESSION['username'];

    if (check_layer($user, $title, $lid)) {
        die_error(-4, "Layer \'$title\' already exists. Changes not saved.");
    } else {
        update_layer($title, $description, $lid);
        echo_success("Changes to layer \'$title\' have been saved.", $lid);
    }
}

mysql_close($con);
?>
