<?php
/**
 * Form for editing resource details.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('Failure to retrieve form for editing layer details.<br><br>Error code: ' . $c . '<br>Message: ' . $m);
}

function get_layer($u, $lid) {
    global $con;
    $v = array("success" => false, "lid" => $lid, "title" => "", "description" => "");
    $sql = "SELECT title,description FROM layer WHERE deleted_at IS NULL AND owner='$u' AND id='$lid' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (($k = mysql_fetch_array($temp))) {
            $v["title"] = $k[0];
            $v["description"] = $k[1];
            $v["success"] = true;
        }
        return $v;
    } else {
        die_error(-1, json_encode(mysql_error()));
    }
}

function return_form($v) {
    ?>
    <div class="form">
        <form dojoType='dijit.form.Form' name='elay' id='elay' method='post'>
            <input type='hidden' name='lid' id='lid' value='<?php echo $v["lid"]; ?>'>
            Title (maximum 40 characters):<br>
            <input type='text' trim='true' name='title' id='title' maxlength='40' value='<?php echo $v["title"]; ?>' style='width: 300px;'><br>
            Description (maximum 400 characters, no line breaks):<br>
            <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"><?php echo $v["description"] ?></textarea><br><br>
            <button type="submit">Save changes</button>
            <button type="button" onClick="dijit.byId('edit-layer-dialog').hide();">Cancel</button>
        </form>
    </div>
    <?php
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $lid = $_GET[lid];
    $user = $_SESSION['username'];

    $v = get_layer($user, $lid);
    if ($v["success"]) {
        return_form($v);
    } else {
        die_error(-2, "Invalid layer.");
    }
}
mysql_close($con);
?>

