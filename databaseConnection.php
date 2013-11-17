<?php
/**
 * Connect to database.
 */
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
    if ($_GET[format] == "json") {
        die('{success: false, errcode: 1, message: ' . json_encode(mysql_error()) . ', regions: null}');
    } else {
        echo '<response><success>false</success><errcode>1</errcode><message>MySQL connection error:' . mysql_error() . '</message><regions></regions></response>';
    }
}
mysql_select_db("ngembryo", $con);
?>
