<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
        <title>Next Generation Embryology: Login Page</title>
        <meta name="author" content="Gagarine Yaikhom" />
        <meta name="keywords" content="ngembryo Woolz Internet Imaging Protocol IIP IIPImage Mootools" />
        <meta name="description" content="Next Generation Embryology Project" />
        <meta name="copyright" content="&copy; 2009, 2010 NG-Embryo Project" />
        <link rel="stylesheet" type="text/css" href="resources/css/login.css" />
    </head>
    <body>
        <h2>The Next Generation Embryology Project</h2>
        <div class="info">
        	3D developmental atlases are used in research for capture, collation and analysis of spatio-temporal data such as in situ gene-expression. The most advanced systems are based on a temporal series of 3D models. Examples are the EADHB human embryo atlas in Newcastle and the e-MouseAtlas in Edinburgh. In this project, we use the 3D spatio-temporal frameworks in conjunction with a repository to deliver research and educational materials directly in the context of the developing embryo. The interface of the prototype NG-Embryo portal is similar to that of Google Maps, while the functionality it provides is similar to that of Wikimapia.
        </div>
        <div class="loginForm">
            <form action="" method="post">
                <table align="left" border="0" cellspacing="0" cellpadding="3">
                    <tr>
                        <td>
                            Username:
                        </td>
                        <td>
                            <input type="text" name="un" maxlength="30">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Password:
                        </td>
                        <td>
                            <input type="password" name="pw" maxlength="30">
                        </td>
                    </tr>
					<?php if ($error) { ?>
                    <tr>
                        <td colspan="2" align="left">
                        <div class="error"><?php echo $error; ?></div>
                        </td>
                    </tr>
                    <?php } ?>
                    <tr>
                        <td colspan="2" align="left">
                            <input type="checkbox" name="rem">
                            Remember me next time
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" align="right">
                            <input type="submit" name="sublogin" value="Login">
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" align="left">
                            <a href="register.php">Join</a>
                        </td>
                    </tr>
                </table>
            </form>
        </div>
    </body>
</html>
