<?php

session_start();
include 'db.php';
include 'utils.php';

/**
 * Checks if the username and password are valid. If so, set the
 * session variables, and also set the session cookie if the user
 * wants to be remembered. Returns true if success; otherwise, false.
 */
function confirmUser($username, $password) {
    global $con;
    $sql = "SELECT id FROM user WHERE deleted_at IS NULL AND username='$username' AND password='$password'";
    $result = mysql_query($sql, $con);
    $row = mysql_fetch_array($result);
    if (mysql_num_rows($result) == 1) {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks if the user is already logged in, and if a session with the
 * user already exists. Also check if user has been remembered.
 * If so, the database is queried to make ensure that the user is
 * authentic. Returns true if the user has logged in.
 */
function checkLogin() {
    /* Check if user has been remembered */
    if (isset($_COOKIE['ckn']) && isset($_COOKIE['ckp'])) {
        $_SESSION['username'] = $_COOKIE['ckn'];
        $_SESSION['password'] = $_COOKIE['ckp'];
    }

    /* Username and password have been set */
    if (isset($_SESSION['username']) && isset($_SESSION['password'])) {
        /* Confirm that username and password are valid */
        if (confirmUser($_SESSION['username'], $_SESSION['password'])) {
            return true;
        }

        /* Variables are incorrect, user not logged in */
        unset($_SESSION['username']);
        unset($_SESSION['password']);
    }
    return false;
}

?>