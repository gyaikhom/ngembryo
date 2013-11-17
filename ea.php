<?php
/**
 * Save changes to annotation details.
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
 * Check if an annotation with the given label already exists.
 */
function check_annotation($u, $aid, $table, $label) {
    global $con;
    $sql = "SELECT id FROM $table WHERE deleted_at IS NULL AND owner='$u' AND label='$label' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            if (($k = mysql_fetch_array($temp))) {
                if ($k[0] == $aid) {
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

function update_annotation($aid, $table, $l, $d) {
    global $con;
    $sql = "UPDATE $table SET label='$l',description='$d',updated_at=NOW() WHERE id=$aid";
    if (!mysql_query($sql, $con)) {
        die_error(-2, json_encode(mysql_error()));
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $label = return_well_formed($_POST[label]);
    $description = return_well_formed($_POST[description]);
    $aid = $_POST[aid];
    $type = $_POST[type];
    $user = $_SESSION['username'];

    if ($type == "m") {
        $table = "2Dmarker";
    } else {
        if ($type == "r") {
            $table = "2Dregion";
        } else {
            die_error(-3, "Unknown annotation type.");
        }
    }

    if (check_annotation($user, $aid, $table, $label)) {
        die_error(-4, "Annotation \'$label\' already exists. Changes not saved.");
    } else {
        update_annotation($aid, $table, $label, $description);
        echo_success("Changes to annotation \'$label\' have been saved.");
    }
}

mysql_close($con);
?>
