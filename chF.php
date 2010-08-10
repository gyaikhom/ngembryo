<?php
/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 *
 * @description Returns the form for changing user details.
 */

include 'login.php';

/**
 * Returns user details.
 */
function getUserDetails($username){
    global $con;
    $sql = "SELECT username,realname,email,affiliation FROM user WHERE deleted_at IS NULL AND username='$username'";
    if ($temp = mysql_query($sql, $con)) {
        if (mysql_numrows($temp) > 0) {
        	if ($x = mysql_fetch_array($temp)) {
        		return $x;
        	}
        } else {
        	die('No user with username \''.$username.'\'');
        }
    } else {
        die(mysql_error());
    }
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
	$u = getUserDetails($_SESSION['username']);
?>
<script type="text/javascript">
    function check() {
      var frm = document.forms["chuser"];
      if (frm.pw.value == null || frm.pw.value.length == 0) {
          alert('Please supply old password.');
          return false;
      }
      if (frm.pw.value.length < 8) {
          alert('Passwords must be atleast 8 characters long.');
          return false;
      }
      if (frm.npw.value == null || frm.npw.value.length == 0) {
          alert('Please supply new password');
          return false;
      }
      if (frm.npw.value.length < 8) {
          alert('New password must be atleast 8 characters long.');
          return false;
      }
      if (frm.rnpw.value == null || frm.rnpw.value.length == 0) {
          alert('Please re-type new password');
          return false;
      }
      if (frm.npw.value != frm.rnpw.value) {
        alert('Supplied new password and re-typed new password do not match!');
        return false;
      }
      if (frm.rn.value == null || frm.rn.value.length < 1) {
          alert('Please supply real name.');
          return false;
      }
      return true;
    }
</script>

<div class="regForm">
<form action="" name="chuser" id="chuser" method="post"
	onsubmit="return check();">
<table align="left" border="0" cellspacing="3" cellpadding="3" width="100%">
	<tr>
		<td align='right' style='width: 130px;'>Username: </td>
		<td><input type='text' readonly='true' trim='true' name='un' id='un' maxlength='100'
            value='<?php echo ($u['username']); ?>' style='width: 100%;'></td>
	</tr>
	<tr>
		<td align='right'>Current password: </td>
		<td><input type='password' trim='true' name='pw' id='pw'
			maxlength='30' value='' style='width: 100%;'></td>
	</tr>
	<tr>
		<td align='right'>New password: </td>
		<td><input type='password' trim='true' name='npw' id='npw'
			maxlength='30' value='' style='width: 100%;'></td>
	</tr>
    <tr>
        <td align='right'>Re-type new password: </td>
        <td><input type='password' trim='true' name='rnpw' id='rnpw'
            maxlength='30' value='' style='width: 100%;'></td>
    </tr>
	<tr>
		<td align='right'>Real name: </td>
		<td><input type='text' trim='true' name='rn' id='rn' maxlength='100'
			value='<?php echo ($u['realname']); ?>' style='width: 100%;'></td>
	</tr>
	<tr>
		<td align='right'>Email: </td>
		<td><input type='text' trim='true' name='em' id='em' maxlength='100'
			value='<?php echo ($u['email']); ?>' style='width: 100%;'></td>
	</tr>
	<tr>
		<td align='right'>Affiliation: </td>
		<td><input type='text' trim='true' name='aff' id='aff' maxlength='100'
			value='<?php echo ($u['affiliation']); ?>' style='width: 100%;'></td>
	</tr>
	<tr><td></td><td></td>&nbsp;</tr>
    <tr>
        <td><input type="submit" name="subch" value="Change details"></td>
        <td align='right'><button type="button" onClick="dijit.byId('change-user-details-dialog').hide();">Cancel</button></td>
    </tr>
	</form>
	</div>
	
	<?php 
}

mysql_close($con);
?>
	