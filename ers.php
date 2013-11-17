<?php
/**
 * Save changes to resource details.
 */
include 'login.php';
global $con;
        
function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '"}');
}

function echo_success($m, $rid) {
    echo '{success: true, errcode: 0, message: "' . $m . '"}';
}

/**
 * Check if a resource with the given title and author exists.
 */
function check_resource($u, $a, $t, $rid) {
    global $con;
    $sql = "SELECT id FROM resource WHERE deleted_at IS NULL AND owner='$u' AND author='$a' AND title='$t' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            if (($k = mysql_fetch_array($temp))) {
                if ($k[0] == $rid) {
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

function update_resource($u, $t, $a, $ab, $rid) {
    global $con;
    $sql = "UPDATE resource SET title='$t',author='$a',abstract='$ab',updated_at=NOW() WHERE id=$rid";
    if (!mysql_query($sql, $con)) {
        die_error(-2, json_encode(mysql_error()));
    }
}

function update_resource_item($rid, $t, $a, $l) {
    global $con;
    $sql = "UPDATE resourceItem SET title='$t',abstract='$a',link='$l',updated_at=NOW() WHERE resource_id=$rid";
    if (!mysql_query($sql, $con)) {
        die_error(-3, json_encode(mysql_error()));
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $rid = $_POST[rid];
    $title = return_well_formed($_POST[title]);
    $author = return_well_formed($_POST[author]);
    $link = $_POST[link];
    $abstract = return_well_formed($_POST[description]);
    $user = $_SESSION['username'];

    if (check_resource($user, $author, $title, $rid)) {
        die_error(-4, "Resource \'$title\' by \'$author\' already exists. Changes not saved.");
    } else {
        update_resource($user, $title, $author, $abstract, $rid);
        update_resource_item($rid, $title, $abstract, $link);
        echo_success("Changes to resource \'$title\' has been saved.", $rid);
    }
}

mysql_close($con);
?>
