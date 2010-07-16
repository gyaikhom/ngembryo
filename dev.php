<?php

include 'login.php';

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
        <title>Next Generation Embryology (development version)</title>
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
        <script type="text/javascript" src="lib/mootools/mootools-1.2.1-core-jm.js">
        </script>
        <script type="text/javascript" src="lib/mootools/mootools-1.2.1-more-jm.js">
        </script>
        <script type="text/javascript">
            dojo.require("dijit.dijit");
            dojo.require("dojo.cookie");
            dojo.require("dojox.gfx");
            dojo.require("dojo.data.ItemFileWriteStore");
            dojo.require("dijit.Toolbar");
            dojo.require("dijit.Tree");
            dojo.require("dijit.layout.BorderContainer");
            dojo.require("dijit.layout.AccordionContainer");
            dojo.require("dijit.layout.TabContainer");
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
            dojo.require("dijit.form.FilteringSelect");
            dojo.require("dijit.form.Textarea");
            dojo.require("dijit.form.VerticalSlider");
            dojo.require("dijit.form.VerticalRule");
            dojo.require("dijit.form.HorizontalSlider");
            dojo.require("dijit.form.HorizontalRule");
            dojo.require("dojox.grid.DataGrid");
            dojo.require("dojox.data.CsvStore");
            dojo.require("dojo.fx");
            dojo.require("dojo.fx.easing");
            dojo.require("dojo.dnd.move");
            dojo.require("dojo.parser");
        </script>
        <script type="text/javascript" src="lib/ngembryo/utils.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/models.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/annotation.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/icon.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/iconManager.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/layerManager.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/marker.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/region.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/engine.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/cookieManager.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/overlays.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/woolz.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/dialogManager.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/orientations.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/layers.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/resources.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/toolbar.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/controlManager.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/tipper.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/feedback.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/content.js">
        </script>
        <script type="text/javascript" src="lib/ngembryo/ngembryo.js">
        </script>
        <style type="text/css">
            @import "lib/dojo/dojo-release-1.4.0/dojo/resources/dojo.css";
            @import "lib/dojo/dojo-release-1.4.0/dijit/themes/soria/soria.css";
            @import "lib/dojo/dojo-release-1.4.0/dojox/grid/resources/Grid.css";
            @import "lib/dojo/dojo-release-1.4.0/dojox/grid/resources/soriaGrid.css";
            @import "resources/css/ngembryo.css";
            @import "resources/css/wlziip.css";
        </style>
        <style type="text/css">
            html, body {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body class="soria">
        <script type="text/javascript">
            var ngembryo;
            var woolz;
            dojo.addOnLoad(function(){
                ngembryo = new NGEmbryo("<?php echo $_SESSION['username']; ?>");
                ngembryo.start();
            });
            dojo.addOnUnload(function(){
                ngembryo.destroy();
            });
        </script>
    </body>
</html>

<?php } ?>
