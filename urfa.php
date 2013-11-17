<?php
/**
 * Unlink resource from annotation.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '",r:null}');
}

function echo_success($m, $id) {
    echo '{success: true, errcode: 0, message: "' . $m . '",r:null}';
}

/**
 * Check if the resource exists.
 */
function check_resource($u, $rid) {
    global $con;
    $sql = "SELECT id FROM resource WHERE deleted_at IS NULL AND owner='$u' AND id=$rid LIMIT 1";
    if (!($temp = mysql_query($sql, $con))) {
        die_error(-1, json_encode(mysql_error()));
    }
    if (mysql_num_rows($temp) > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if the annotation exists.
 */
function check_annotation($u, $table, $aid) {
    global $con;
    $sql = "SELECT id FROM $table WHERE deleted_at IS NULL AND owner='$u' AND id=$aid LIMIT 1";
    if (!($temp = mysql_query($sql, $con))) {
        die_error(-2, json_encode(mysql_error()));
    }
    if (mysql_num_rows($temp) > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if the resource is already linked to the annotation.
 */
function check_linked($u, $table, $aid, $rid) {
    global $con;
    $sql = "SELECT id FROM $table WHERE deleted_at IS NULL AND owner='$u' AND annotation_id=$aid AND resource_id=$rid LIMIT 1";
    if (!($temp = mysql_query($sql, $con))) {
        die_error(-3, json_encode(mysql_error()));
    }
    if (mysql_num_rows($temp) > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Unlink resource from annotation
 */
function unlink_resource_from_annotation($u, $table, $aid, $rid) {
    global $con;
    $sql = "UPDATE $table SET deleted_at=NOW() WHERE owner='$u' AND annotation_id=$aid AND resource_id=$rid";
    if (!mysql_query($sql, $con)) {
        die_error(-4, json_encode(mysql_error()));
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $rid = $_GET[rid];
    $aid = $_GET[aid];
    $type = $_GET[type];
    $table = "";
    $user = $_SESSION['username'];

    if ($type == "m") {
        $table = "2Dmarker";
    } else {
        if ($type == "r") {
            $table = "2Dregion";
        } else {
            die_error(1, "Unknown annotation type.");
        }
    }

    if (check_resource($user, $rid)) {
        if (check_annotation($user, $table, $aid)) {
            $table = $table . "Resource";
            if (check_linked($user, $table, $aid, $rid)) {
                unlink_resource_from_annotation($user, $table, $aid, $rid);
                echo_success("Resource has been removed from the annotation.", $rid);
            } else {
                die_error(2, "Resource not linked to the annotation.");
            }
        } else {
            die_error(3, "Supplied annotation does not exists.");
        }
    } else {
        die_error(4, "Supplied resource does not exists.");
    }
}

mysql_close($con);
?>
