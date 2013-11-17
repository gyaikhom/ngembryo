<?php
/**
 * Get models.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('{success:false,errcode:' . $c . ',message:"' . $m . '",m:null}');
}

function echo_success($m, $mo) {
    echo '{success:true,errcode:0,message:"' . $m . '",m:' . $mo . '}';
}

function get_models() {
    global $con;
    $sql = "SELECT * FROM model WHERE deleted_at IS NULL ORDER BY title ASC";
    if (($m = mysql_query($sql, $con))) {
        return $m;
    } else {
        die_error(-1, json_encode(mysql_error()));
    }
}

function encode_model($m) {
    return '{id:' . $m['id'] . ',title:' . json_encode($m['title']) . ',description:' . json_encode($m['description']) . ',stack:' . json_encode($m['stack']) . ',server:' . json_encode($m['server']) . ',webpath:' . json_encode($m['webpath']) . ',fspath:' . json_encode($m['fspath']) . ',initialdst:' . $m['initialdst'] . ',assayid:' . json_encode($m['assayid']) . ',imgtitle:' . json_encode($m['imgtitle']) . ',external:' . json_encode($m['external']) . ',tileframe:{enable:' . $m['tileframe'] . '},locator:{enable:' . $m['locator'] . '},sectionplane:{enable:' . $m['sectionplane'] . ',src:' . json_encode($m['sp_src']) . ',inc:' . $m['sp_inc'] . ',numpit:' . $m['sp_numpit'] . ',numyaw:' . $m['sp_numyaw'] . ',title:' . json_encode($m['sp_title']) . ',bgcolor:' . json_encode($m['sp_bgcolor']) . '}}';
}

function encode_models($ms) {
    $str = '[';
    if (($m = mysql_fetch_array($ms))) {
        $str .= encode_model($m);
        while ($m = mysql_fetch_array($ms)) {
            $str .= ',' . encode_model($m);
        }
    }
    return $str . ']';
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $ms = get_models();
    $json = encode_models($ms);
    echo_success("Models retrieved successfully.", $json);
}
mysql_close($con);
?>
