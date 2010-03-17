<?php

/* Escapes quotes if not already done. */
function return_well_formed($string) {
    if(get_magic_quotes_gpc()) {
        return $string;
    } else {
        return mysql_real_escape_string($string);
    }
}
?>
