<?php
/**
 * Change user details.
 */
include 'login.php';

function die_error($c, $m) {
    die('{success: false, errcode: ' . $c . ', message: "' . $m . '"}');
}

function echo_success($m) {
    echo '{success: true, errcode: 0, message: "' . $m . '"}';
}

/**
 * Changes user details. Returns true on success, false otherwise.
 */
function changeUserDetails($username, $password, $realname, $email, $affiliation) {
    global $con;
    $sql = "UPDATE user SET password='$password',realname='$realname',email='$email',affiliation='$affiliation',updated_at=NOW() WHERE deleted_at IS NULL AND username='$username'";
    return mysql_query($sql, $con);
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    /* Supplied by the client (check for sanity). */
    if (!check_sanity($_POST['un'], 'username')) {
        $error = "<li><b>Invalid username</b><p>Username must have at least 5 and at most 16 characters. Must begin with a letter, followed by letters, digits and '_'.</p></li>";
    }
    if (!check_sanity($_POST['npw'], 'password')) {
        $error .= "<li><b>Invalid password</b><p>Password must have at least 8 and at most 30 characters. Must also have a digit, a lowercase letter and an uppercase letter.</p></li>";
    }
    if (!check_sanity($_POST['em'], 'email')) {
        $error .= "<li><b>Invalid email</b></li>";
    }

    if (!$error) {
        $username = return_well_formed($_POST[un]);
        $npassword = md5(return_well_formed($_POST[npw]));
        $realname = return_well_formed($_POST[rn]);
        $email = return_well_formed($_POST[em]);
        $affiliation = return_well_formed($_POST[aff]);

        if ($username != $_SESSION['username']) {
            die_error(-1, "Supplied username does not belong to this session.");
        }

        if (changeUserDetails($username, $npassword, $realname, $email, $affiliation)) {
            $_SESSION['username'] = $username;
            $_SESSION['password'] = $npassword;
            if (isset($_POST['rem'])) {
                setcookie("ckn", $_SESSION['username'], time() + 60 * 60 * 24 * 100, "/");
                setcookie("ckp", $_SESSION['npassword'], time() + 60 * 60 * 24 * 100, "/");
            }
            echo_success("User details changed successfully.");
        } else {
            die_error(-2, "Failed to change user details! Please try again.");
        }
    } else {
        $error = "Failed to change user details! Please try again.<ul>" . $error . "</ul>";
        die_error(-3, $error);
    }
}

mysql_close($con);
?>
