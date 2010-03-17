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
	echo '{id:'.$row['id'].',title:'.json_encode($row['title']).',description:'.json_encode($row['description']).',stack:'.json_encode($row['stack']).',server:'.json_encode($row['server']).',webpath:'.json_encode($row['webpath']).',fspath:'.json_encode($row['fspath']).',initialdst:'.$row['initialdst'].',assayid:'.json_encode($row['assayid']).',imgtitle:'.json_encode($row['imgtitle']).',external:'.json_encode($row['external']).',tileframe:{enable:'.$row['tileframe'].'},locator:{enable:'.$row['locator'].'},sectionplane:{enable:'.$row['sectionplane'].',src:'.json_encode($row['sp_src']).',inc:'.$row['sp_inc'].',numpit:'.$row['sp_numpit'].',numyaw:'.$row['sp_numyaw'].',title:'.json_encode($row['sp_title']).',bgcolor:'.json_encode($row['sp_bgcolor']).'}}';
	while ($row = mysql_fetch_array($result)) {
		echo ',{id:'.$row['id'].',title:'.json_encode($row['title']).',description:'.json_encode($row['description']).',stack:'.json_encode($row['stack']).',server:'.json_encode($row['server']).',webpath:'.json_encode($row['webpath']).',fspath:'.json_encode($row['fspath']).',initialdst:'.$row['initialdst'].',assayid:'.json_encode($row['assayid']).',imgtitle:'.json_encode($row['imgtitle']).',external:'.json_encode($row['external']).',tileframe:{enable:'.$row['tileframe'].'},locator:{enable:'.$row['locator'].'},sectionplane:{enable:'.$row['sectionplane'].',src:'.json_encode($row['sp_src']).',inc:'.$row['sp_inc'].',numpit:'.$row['sp_numpit'].',numyaw:'.$row['sp_numyaw'].',title:'.json_encode($row['sp_title']).',bgcolor:'.json_encode($row['sp_bgcolor']).'}}';
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
