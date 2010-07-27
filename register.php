<?php
session_start();
include("db.php");
include("utils.php");

/**
 * Returns true if the username already exists; false otherwise.
 */
function usernameTaken($username){
	global $con;
	$sql = "SELECT * FROM user WHERE deleted_at IS NULL AND username='$username'";
	if ($result = mysql_query($sql, $con)) {
		return (mysql_numrows($result) > 0);
	} else {
		die('{success: false, errcode: 3, message: '.json_encode(mysql_error()).', uid: 0}');
	}
}

/**
 * Creates a new user. Returns true on success, false otherwise.
 */
function addNewUser($username, $password, $realname, $email, $affiliation){
	global $con;
	$sql = "INSERT INTO user (username, password, realname, email, affiliation, created_at) VALUES ('$username', MD5('$password'), '$realname', '$email', '$affiliation', NOW())";
	return mysql_query($sql,$con);
}

if(isset($_POST['subreg'])){
	/* Supplied by the client. */
	$username = return_well_formed(trim($_POST[un]));
	$password = return_well_formed($_POST[pw]);
	$realname = return_well_formed($_POST[rn]);
	$email = return_well_formed($_POST[em]);
	$affiliation = return_well_formed($_POST[aff]);

	if(usernameTaken($username)){
		$error = "Username ".$username." is already taken. Please choose a different username.";
	} else {
		if (addNewUser($username, $password, $realname, $email, $affiliation)) {
			echo "<html><head><meta http-equiv='Refresh' content='2; url=ngembryo.php'>";
			echo "<link rel='stylesheet' type='text/css' href='resources/css/login.css' /></head>";
			echo "<body><div class='success'>Registration was successful! You will now be redirected to the <a href='ngembryo.php'>login page</a>.</div></body></html>";
			return;
		} else {
			$error = "Failed to create user! Please try again.";
		}
	}
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<title>Next Generation Embryology: Registration Page</title>
<meta name="author" content="Gagarine Yaikhom" />
<meta name="keywords"
	content="ngembryo Woolz Internet Imaging Protocol IIP IIPImage Mootools" />
<meta name="description" content="Next Generation Embryology Project" />
<meta name="copyright" content="&copy; 2009, 2010 NG-Embryo Project" />
<link rel="stylesheet" type="text/css" href="resources/css/login.css" />
</head>
<body>
<script type="text/javascript">
    function check() {
      var frm = document.forms["cuser"];
      if (frm.un.value == null || frm.un.value.length < 1) {
          alert('Please supply username.');
          return false;
      }
      if (frm.pw.value.length > 30) {
          alert('Username must not have more than 30 characters.');
          return false;
      }
      if (frm.pw.value == null || frm.pw.value.length == 0) {
          alert('Please supply password.');
          return false;
      }
      if (frm.pw.value.length < 8) {
          alert('Passwords must be atleast 8 characters long.');
          return false;
      }
      if (frm.rpw.value == null || frm.rpw.value.length == 0) {
          alert('Please re-type password');
          return false;
      }
      if (frm.pw.value != frm.rpw.value) {
        alert('Supplied password and re-typed password do not match!');
        return false;
      }
      if (frm.rn.value == null || frm.rn.value.length < 1) {
          alert('Please supply real name.');
          return false;
      }
      return true;
    }
</script>
<h2>The Next Generation Embryology Project</h2>
<div class="regForm">
<form action="" name="cuser" id="cuser" method="post"
	onsubmit="return check();">
<table align="left" border="0" cellspacing="0" cellpadding="3">
<?php if ($error) { ?>
	<tr>
		<td colspan="2" align="left">
		<div class="error"><?php echo $error; ?></div>
		</td>
	</tr>
	<?php } ?>
	<tr>
		<td>Username:</td>
		<td><input type='text' trim='true' name='un' id='un' maxlength='30'
			value='' style='width: 300px;'></td>
	</tr>
	<tr>
		<td>Password:</td>
		<td><input type='password' trim='true' name='pw' id='pw'
			maxlength='30' value='' style='width: 300px;'></td>
	</tr>
	<tr>
		<td>Re-type password:</td>
		<td><input type='password' trim='true' name='rpw' id='rpw'
			maxlength='30' value='' style='width: 300px;'></td>
	</tr>
	<tr>
		<td>Real name:</td>
		<td><input type='text' trim='true' name='rn' id='rn' maxlength='100'
			value='' style='width: 300px;'></td>
	</tr>
	<tr>
		<td>Email:</td>
		<td><input type='text' trim='true' name='em' id='em' maxlength='100'
			value='' style='width: 300px;'></td>
	</tr>
	<tr>
		<td>Affiliation:</td>
		<td><input type='text' trim='true' name='aff' id='aff' maxlength='100'
			value='' style='width: 300px;'></td>
	</tr>
    <tr>
        <td colspan="2" align="right"><input type="submit" name="subreg" value="Register"></td>
    </tr>
	<tr>
		<td colspan="2" align="left"><a href='ngembryo.php'>Return to login page</a></td>
	</tr>
	</form>
	</div>

</body>

</html>