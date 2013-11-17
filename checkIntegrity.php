<?php
/**
 * Checks database integrity.
 */
$error = false;

/**
 * Check if table exists.
 */
function check_table($name, $con) {
    $sql = "DESC " . $name;
    mysql_query($sql, $con);
    if (mysql_errno() == 1146) {
        return false;
    } elseif (!mysql_errno()) {
        return true;
    }
}

/**
 * Check if client can connect to the ngembryo database server.
 */
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
$message = "Success";
if (!$con) {
    $message = "(failure to connect to server)" . mysql_error();
    $error = true;
} else {

    /* Check if client can use the ngembryo database. */
    if (mysql_select_db("ngembryo", $con)) {
        /* Check the tables. */
        $tbs = array("2Dmarker", "2DmarkerResource", "2Dpolyline", "2Dregion", "2DregionResource", "3Dmarker", "resource");
        $x = "tables: {";
        $x = $x . "\"" . $tbs[0] . "\": ";
        if (check_table($tbs[0], $con))
            $x = $x . "true";
        else {
            $error = true;
            $message = "Some of the tables are missing in the annotation database.";
            $x = $x . "false";
        }
        for ($i = 1; $i < count($tbs); $i++) {
            $x = $x . ", \"" . $tbs[$i] . "\": ";
            if (check_table($tbs[$i], $con))
                $x = $x . "true";
            else {
                $error = true;
                $message = "Some of the tables are missing in the annotation database.";
                $x = $x . "false";
            }
        }
        $x = $x . "}";
        mysql_close($con);
    } else {
        $message = "(failure to use database 'ngembryo')" . mysql_error();
        $error = true;
    }
}

/**
 * Return the values to the client accordingly.
 */
if ($error) {
    $response = "{success: false, message: \"" . $message . "\"}";
} else {
    $response = "{success: true, message: \"" . $message . "\", " . $x . "}";
}
print($response);
?>
