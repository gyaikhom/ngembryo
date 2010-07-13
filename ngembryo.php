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
	$sql="SELECT id FROM user WHERE deleted_at IS NULL AND username='$username' AND password='$password'";
	$result = mysql_query($sql, $con);
	$row = mysql_fetch_array($result);
	if(mysql_num_rows($result) == 1) {
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
function checkLogin(){
	/* Check if user has been remembered */
	if(isset($_COOKIE['ckn']) && isset($_COOKIE['ckp'])){
		$_SESSION['username'] = $_COOKIE['ckn'];
		$_SESSION['password'] = $_COOKIE['ckp'];
	}

	/* Username and password have been set */
	if(isset($_SESSION['username']) && isset($_SESSION['password'])){
		/* Confirm that username and password are valid */
		if(confirmUser($_SESSION['username'], $_SESSION['password'])) {
			return true;
		}

		/* Variables are incorrect, user not logged in */
		unset($_SESSION['username']);
		unset($_SESSION['password']);
	}
	return false;
}

if(isset($_POST['sublogin'])) {
	/* Supplied by the client. */
	$username = return_well_formed(trim($_POST['un']));
	$password = return_well_formed($_POST['pw']);
	$md5pass = md5($password);
	$result = confirmUser($username, $md5pass);
	if ($result) {
		$_SESSION['username'] = $username;
		$_SESSION['password'] = $md5pass;
		if(isset($_POST['rem'])){
			setcookie("ckn", $_SESSION['username'], time()+60*60*24*100, "/");
			setcookie("ckp", $_SESSION['password'], time()+60*60*24*100, "/");
		}
	} else {
		$error = 'Invalid username or password. Please try again.';
	}
}

$logged_in = checkLogin(); 
if (!$logged_in) {
	include 'loginForm.php';
} else { ?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html class="dj_gecko">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
        <title>Next Generation Embryology</title>
        <meta name="author" content="Gagarine Yaikhom" />
        <meta name="keywords" content="ngembryo Woolz Internet Imaging Protocol IIP IIPImage Mootools" />
        <meta name="description" content="Next Generation Embryology Project" />
        <meta name="copyright" content="&copy; 2009, 2010 NG-Embryo Project" />
        <script src="http://www.google.com/jsapi" type="text/javascript">
        </script>
        <script type="text/javascript">
            var djConfig = {
                parseOnLoad: true,
                isDebug: false
            };
        </script>
        <script type="text/javascript" src="lib/dojo/dojo-release-1.4.0/dojo/dojo.js">
        </script>
        <script type="text/javascript" src="lib/mootools/mootools-1.2.1-core-yc.js">
        </script>
        <script type="text/javascript" src="lib/mootools/mootools-1.2.1-more-yc.js">
        </script>
        <script type="text/javascript">
            dojo.require("dijit.dijit");
            dojo.require("dojo.cookie");
            dojo.require("dojox.gfx");
            dojo.require("dijit.Toolbar");
            dojo.require("dijit.layout.BorderContainer");
            dojo.require("dijit.layout.ContentPane");
            dojo.require("dijit.form.Button");
            dojo.require("dijit.Menu");
            dojo.require("dijit.MenuItem");
            dojo.require("dijit.Tooltip");
            dojo.require("dijit.Dialog");
            dojo.require("dijit.form.Form");
            dojo.require("dijit.form.TextBox");
            dojo.require("dijit.form.DropDownButton");
            dojo.require("dijit.form.ComboBox");
            dojo.require("dijit.form.CheckBox");
            dojo.require("dijit.form.Textarea");
            dojo.require("dojo.fx");
            dojo.require("dojo.fx.easing");
            dojo.require("dojo.dnd.move");
            dojo.require("dojo.parser");
        </script>
        <script type="text/javascript" src="lib/ngembryo/ngc.js">
        </script>
        <style type="text/css">
            @import "lib/dojo/dojo-release-1.4.0/dojo/resources/dojo.css";
            @import "lib/dojo/dojo-release-1.4.0/dijit/themes/soria/soria.css";
            @import "resources/css/ngembryo.css";
        </style>
    </head>
    <body class="soria">
        <script type="text/javascript">
            var ngembryo;
            var woolz;
            dojo.addOnLoad(function(){
                ngembryo = new NGEmbryo();
                ngembryo.start();
            });
            dojo.addOnUnload(function(){
                ngembryo.destroy();
            });
        </script>
    </body>
</html>

<?php } ?>
