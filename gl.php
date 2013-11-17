<?php
/**
 * Get layers.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('{success:false,errcode:' . $c . ',message:"' . $m . '",l:null}');
}

function echo_success($m, $l) {
    echo '{success:true,errcode:0,message:"' . $m . '",l:' . $l . '}';
}

function find_orientation($u, $m, $y, $p, $r, $d) {
    global $con;
    $sql = "SELECT id FROM orientation WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND model_id='$m' AND yaw='$y' AND pitch='$p' AND roll='$r' AND distance='$d'";
    if (($temp = mysql_query($sql, $con))) {
        if (mysql_num_rows($temp) > 0) {
            return $temp;
        } else {
            die_error(-1, "Orientation not found.");
        }
    } else {
        die_error(-2, json_encode(mysql_error()));
    }
}

function get_layers($u, $oid) {
    global $con;
    $sql = "SELECT * FROM layer WHERE deleted_at IS NULL AND (owner='$u' OR owner='admin') AND orientation_id=$oid";
    if (($temp = mysql_query($sql, $con))) {
        return $temp;
    } else {
        die_error(-3, json_encode(mysql_error()));
    }
}

function encode_layer($l, $u) {
    $m = 0;
    if ($l['owner'] == $u)
        $m = 1;
    return '{i:' . $l['id'] . ',m:' . $m . ',v:true,t:' . json_encode($l['title']) . ',s:' . json_encode($l['summary']) . ',d:' . json_encode($l['description']) . '}';
}

function encode_layers($lyrs) {
    $u = $_SESSION['username'];
    if (($l = mysql_fetch_array($lyrs))) {
        $str .= encode_layer($l, $u);
    }
    while ($l = mysql_fetch_array($lyrs)) {
        $str .= ',' . encode_layer($l, $u);
    }
    return $str;
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $model = $_GET[model];
    $yaw = $_GET[yaw];
    $pitch = $_GET[pitch];
    $roll = $_GET[roll];
    $distance = $_GET[distance];
    $user = $_SESSION['username'];

    $oids = find_orientation($user, $model, $yaw, $pitch, $roll, $distance);
    $json = "";
    if (($oid = mysql_fetch_array($oids))) {
        $lyrs = get_layers($user, $oid[0]);
        $json .= encode_layers($lyrs);
        while ($oid = mysql_fetch_array($oids)) {
            $lyrs = get_layers($user, $oid[0]);
            if (mysql_num_rows($lyrs) > 0) {
                $json .= ',';
                $json .= encode_layers($lyrs);
            }
        }
    }
    echo_success("Layers retrieved successfully.", '[' . $json . ']');
}

mysql_close($con);
?>
