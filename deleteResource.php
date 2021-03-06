<?php
/**
 * Delete resource.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '"}');
}

function echo_success($m) {
    echo '{success: true, errcode: 0, message: "' . $m . '"}';
}

function unlink_from_annotations($u, $rid) {
    global $con;
    $sql = "UPDATE 2DmarkerResource SET deleted_at=NOW() WHERE resource_id=$rid AND owner='$u'";
    if (!mysql_query($sql, $con)) {
        die_error(-1, json_encode(mysql_error()));
    }
    $sql = "UPDATE 2DregionResource SET deleted_at=NOW() WHERE resource_id=$rid AND owner='$u'";
    if (!mysql_query($sql, $con)) {
        die_error(-2, json_encode(mysql_error()));
    }
}

function remove_resource_items($rid) {
    global $con;
    $sql = "UPDATE resourceItem SET deleted_at=NOW() WHERE resource_id=$rid";
    if (!mysql_query($sql, $con)) {
        die_error(-3, json_encode(mysql_error()));
    }
}

function remove_resource($u, $rid) {
    global $con;
    $sql = "UPDATE resource SET deleted_at=NOW() WHERE id=$rid AND owner='$u'";
    if (!mysql_query($sql, $con)) {
        die_error(-4, json_encode(mysql_error()));
    }
    $sql = "SELECT title FROM resource WHERE id=$rid AND owner='$u' LIMIT 1";
    if ($temp = mysql_query($sql, $con)) {
        $row = mysql_fetch_array($temp);
        return $row[0];
    } else {
        die_error(-5, json_encode(mysql_error()));
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $rid = $_GET[rid];
    $user = $_SESSION['username'];

    unlink_from_annotations($user, $rid);
    remove_resource_items($user, $rid);
    $t = remove_resource($user, $rid);
    echo_success("Resource \'$t\' has been deleted.");
}

mysql_close($con);
?>
