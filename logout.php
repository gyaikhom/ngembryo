<?php
session_start();

if(isset($_COOKIE['ckn']) && isset($_COOKIE['ckp'])){
   setcookie("ckn", "", time()-60*60*24*100, "/");
   setcookie("ckp", "", time()-60*60*24*100, "/");
}

if(session_destroy())
{
	header("Location: ngembryo.php");
}
?>
