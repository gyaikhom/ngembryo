<?php
/**
 * Form for editing annotation details.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('Failure to retrieve form for editing annotation details.<br><br>Error code: ' . $c . '<br>Message: ' . $m);
}

function get_annotation($u, $aid, $type) {
    global $con;
    if ($type == "m") {
        $table = "2Dmarker";
    } else {
        if ($type == "r") {
            $table = "2Dregion";
        } else {
            die_error(-1, "Unknown annotation type.");
        }
    }

    $v = array("success" => false, "type" => $type, "aid" => $aid, "title" => "", "description" => "");
    $sql = "SELECT label,description FROM $table WHERE deleted_at IS NULL AND owner='$u' AND id='$aid' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (($k = mysql_fetch_array($temp))) {
            $v["label"] = $k[0];
            $v["description"] = $k[1];
            $v["success"] = true;
        }
        return $v;
    } else {
        die_error(-2, json_encode(mysql_error()));
    }
}

function return_form($v) {
    ?>
    <div class="form">
        <form dojoType='dijit.form.Form' name='eann' id='eann' method='post'>
            <input type='hidden' name='aid' id='aid' value='<?php echo $v["aid"]; ?>'>
            <input type='hidden' name='type' id='type' value='<?php echo $v["type"]; ?>'>
            Label (maximum 40 characters):<br>
            <input type='text' trim='true' name='label' id='label' maxlength='40' value='<?php echo $v["label"]; ?>' style='width: 300px;'><br>
            Description (maximum 400 characters, no line breaks):<br>
            <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"><?php echo $v["description"] ?></textarea><br><br>
            <button type="submit">Save changes</button>
            <button type="button" onClick="dijit.byId('edit-annotation-dialog').hide();">Cancel</button>
        </form>
    </div>
    <?php
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $aid = $_GET[aid];
    $type = $_GET[type];
    $user = $_SESSION['username'];

    $v = get_annotation($user, $aid, $type);
    if ($v["success"]) {
        return_form($v);
    } else {
        die_error(-3, "Invalid annotation.");
    }
}
mysql_close($con);
?>

