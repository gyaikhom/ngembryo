<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<title>Next Generation Embryology: Login Page</title>
<meta name="author" content="Gagarine Yaikhom" />
<meta name="keywords"
	content="ngembryo Woolz Internet Imaging Protocol IIP IIPImage Mootools" />
<meta name="description" content="Next Generation Embryology Project" />
<meta name="copyright" content="&copy; 2009, 2010 NG-Embryo Project" />
<link rel="stylesheet" type="text/css" href="resources/css/login.css" />
</head>
<body>
<h2>The Next Generation Embryology Project</h2>
<div id="loginInfo">
<!--<span
	style="color: #ff0000; text-decoration: blink;">The ngembryo portal
will be down for maintenance from 4pm, Friday 24th September to 9am,
Monday 27th September 2010</span><br>-->
<br>

3D developmental atlases are used in research for capture, collation and
analysis of spatio-temporal data such as in situ gene-expression. The
most advanced systems are based on a temporal series of 3D models.
Examples are the <a href="http://www.hudsen.org/">HUDSEN</a> human
embryo atlas in Newcastle and the <a href="http://www.emouseatlas.org/">e-MouseAtlas</a>
in Edinburgh. In this project, we use the 3D spatio-temporal frameworks
in conjunction with a repository to deliver research and educational
materials directly in the context of the developing embryo. The
interface of the prototype Next Generation Embryology (NG-Embryo) portal is similar to that of <a
	href="http://maps.google.co.uk">Google Maps</a>, while the
functionality it provides is similar to that of <a
	href="http://www.wikimapia.org">Wikimapia</a>.<br>
<ul>
	<li><a href="http://dl.dropbox.com/u/5546862/User%20Tutorial.ppt">Tutorial
	for using the NG-Embryo portal (powerpoint slides)</a>
	</li>
	<li><a href="http://dl.dropbox.com/u/5546862/User%20Instructions.doc">User manual (document)</a>
	</li>
	<li><a href="http://screencast.com/t/YzE5N2QwMWE">Quick demonstration
	of the NG-Embryo portal (video)</a></li>
	<li><a href="http://screencast.com/t/ZmU1YjIzZDIt">How to add a new
	marker and link a resource (video)</a></li>
	<li><a href="http://screencast.com/t/NzEwNGEy">How to create a new
	orientation, layer, marker and region (video)</a></li>
	<li><a href="http://screencast.com/t/NDI3MDM2YjMt">Uploading resources
	to the repository (video)</a></li>
	<li><a href="http://dl.dropbox.com/u/5546862/NGEmbryo_technical.ppt">Technical information about the NG-Embryo portal (powerpoint slides)</a>
	</li>
	<li><a href="http://sourceforge.net/projects/ngembryo/">NG-Embryo portal source codes</a>
	</li>
</ul>
</br>

Note: The portal has only been tested on <a href="http://www.firefox.com">Firefox</a>, <a href="http://www.google.com/chrome">Chrome</a> and <a href="http://www.apple.com/safari/">Safari</a>.
</div>
<div id="loginForm">
<form action="" method="post">
<table align="left" border="0" cellspacing="0" cellpadding="3">
	<tr>
		<td>Username:</td>
		<td><input type="text" name="un" maxlength="30"></td>
	</tr>
	<tr>
		<td>Password:</td>
		<td><input type="password" name="pw" maxlength="30"></td>
	</tr>
	<?php if ($error) { ?>
	<tr>
		<td colspan="2" align="left">
		<div class="error"><?php echo $error; ?></div>
		</td>
	</tr>
	<?php } ?>
	<tr>
		<td colspan="2" align="left"><input type="checkbox" name="rem">
		Remember me next time</td>
	</tr>
	<tr>
		<td colspan="2" align="right"><input type="submit" name="sublogin"
			value="Login"></td>
	</tr>
	<tr>
		<td colspan="2" align="left"><a href="register.php">Join</a></td>
	</tr>
</table>
</form>
</div>
<table id="loginLogo">
	<td><a href="http://www.jisc.ac.uk/"><img
		src="resources/images/JISCcolour15.gif"></img></a></td>
	<td><a href="http://www.inf.ed.ac.uk/"><img
		src="resources/images/ed.jpg"></img></a></td>
	<td><a href="http://www.hgu.mrc.ac.uk/"><img
		src="resources/images/hgu.gif"></img></a></td>
	<td><a href="http://www.ncl.ac.uk/ihg/"><img
		src="resources/images/ncl.gif"></img></a></td>
	<td style="width: 40%;"></td>
</table>

</body>
</html>
