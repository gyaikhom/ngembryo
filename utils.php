<?php

/* Escapes quotes if not already done. */
function return_well_formed($string) {
    if(get_magic_quotes_gpc()) {
        return $string;
    } else {
        return mysql_real_escape_string($string);
    }
}

/* Sanity check. */
function check_sanity($data, $type) {
	switch ($type) {
		case 'username':
			/* Must have at least 5 characters and at most 16 characters.
			 * Must begin with a letter, followed by letters, digits and '_'
			 */
			$pattern = "/^[a-zA-Z]+[a-zA-Z0-9_]{4,15}$/";
			break;
		case 'password':
			/* Must have at least 8 characters and at most 30 characters.
			 * Should contain a digit, a lowercase letter and an uppercase
			 * letter.
			 */
			$pattern = "/^.*(?=.{8,30})(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/";
			break;
		case 'email':
			$pattern = "/^[a-zA-Z][a-zA-Z0-9_]*([.][a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}$/";
			break;
		default:
			return false;
	}
	return preg_match($pattern, $data);
}
?>
