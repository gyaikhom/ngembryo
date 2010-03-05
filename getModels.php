<?php
$con = mysql_connect("localhost", "ngembryo", "ngembryo");
if (!$con) {
	die('Could not connect: '.mysql_error());
}
mysql_select_db("ngembryo", $con);
$result = mysql_query("SELECT * FROM model");
if ($_GET[format] == "json") {
	echo '[';
	if ($row = mysql_fetch_array($result))
	echo '{id:'.$row['id'].',title:"'.$row['title'].'",description:"'.$row['description'].'",stack:"'.$row['stack'].'",server:"'.$row['server'].'",webpath:"'.$row['webpath'].'",fspath:"'.$row['fspath'].'",initialdst:'.$row['initialdst'].',assayid:"'.$row['assayid'].'",imgtitle:"'.$row['imgtitle'].'",external:"'.$row['external'].'",tileframe:{enable:'.$row['tileframe'].'},locator:{enable:'.$row['locator'].'},sectionplane:{enable:'.$row['sectionplane'].',src:"'.$row['sp_src'].'",inc:'.$row['sp_inc'].',numpit:'.$row['sp_numpit'].',numyaw:'.$row['sp_numyaw'].',title:"'.$row['sp_title'].'",bgcolor:"'.$row['sp_bgcolor'].'"}}';
	while ($row = mysql_fetch_array($result)) {
		echo ',{id:'.$row['id'].',title:"'.$row['title'].'",description:"'.$row['description'].'",stack:"'.$row['stack'].'",server:"'.$row['server'].'",webpath:"'.$row['webpath'].'",fspath:"'.$row['fspath'].'",initialdst:'.$row['initialdst'].',assayid:"'.$row['assayid'].'",imgtitle:"'.$row['imgtitle'].'",external:"'.$row['external'].'",tileframe:{enable:'.$row['tileframe'].'},locator:{enable:'.$row['locator'].'},sectionplane:{enable:'.$row['sectionplane'].',src:"'.$row['sp_src'].'",inc:'.$row['sp_inc'].',numpit:'.$row['sp_numpit'].',numyaw:'.$row['sp_numyaw'].',title:"'.$row['sp_title'].'",bgcolor:"'.$row['sp_bgcolor'].'"}}';
	}
	echo ']';
} else {
	echo '<models>';
	while ($row = mysql_fetch_array($result)) {
		echo '<model><id>'.$row['id'].'</id><title>'.$row['title'].'</title><description>'.$row['description'].'</description><stack>'.$row['stack'].'</stack><server>'.$row['server'].'</server><webpath>'.$row['webpath'].'</webpath><fspath>'.$row['fspath'].'</fspath><initialdst>'.$row['initialdst'].'</initialdst><assayid>'.$row['assayid'].'</assayid><imgtitle>'.$row['imgtitle'].'</imgtitle><external>'.$row['external'].'</external><tileframe><enable>'.$row['tileframe'].'</enable></tileframe><locator><enable>'.$row['locator'].'</enable></locator><sectionplane><enable>'.$row['sectionplane'].'</enable><src>'.$row['sp_src'].'</src><inc>'.$row['sp_inc'].'</inc><numpit>'.$row['sp_numpit'].'</numpit><numyaw>'.$row['sp_numyaw'].'</numyaw><title>'.$row['sp_title'].'</title><bgcolor>'.$row['sp_bgcolor'].'</bgcolor></sectionplane></model>';
	}
	echo '</models>';
}
mysql_close($con);
?>
