<?php
/**
 * Form for editing resource details.
 */
include 'login.php';
global $con;

function die_error($c, $m) {
    die('Failure to retrieve form for editing resource details.<br><br>Error code: ' . $c . '<br>Message: ' . $m);
}

/* Get resource details. */

function get_resource($u, $rid) {
    global $con;
    $v = array("success" => false, "rid" => $rid, "author" => "", "title" => "", "abstract" => "", "link" => "");
    $sql = "SELECT author,title,abstract FROM resource WHERE deleted_at IS NULL AND owner='$u' AND id='$rid' LIMIT 1";
    if (($temp = mysql_query($sql, $con))) {
        if (($k = mysql_fetch_array($temp))) {
            $v["author"] = $k[0];
            $v["title"] = $k[1];
            $v["abstract"] = $k[2];
            $sql = "SELECT link FROM resourceItem WHERE deleted_at IS NULL AND resource_id='$rid' LIMIT 1";
            if (($temp = mysql_query($sql, $con))) {
                if (($k = mysql_fetch_array($temp))) {
                    $v["link"] = $k[0];
                    $v["success"] = true;
                }
            } else {
                die_error(-1, json_encode(mysql_error()));
            }
        }
        return $v;
    } else {
        die_error(-2, json_encode(mysql_error()));
    }
}

function return_form($v) {
    ?>
    <div class="form">
        <form dojoType='dijit.form.Form' name='eres' id='eres' method='post'><input
                type='hidden' trim='true' name='rid' id='rid'
                value='<?php echo $v['rid']; ?>'> Author: <input type='text'
                trim='true' name='author' id='author'
                value='<?php echo $v['author']; ?>' style='width: 100%;'><br>
            Title (maximum 100 characters):<br>
            <input type='text' trim='true' name='title' id='title' maxlength='100'
                   value='<?php echo $v['title']; ?>' style='width: 100%;'><br>
            URI: <input type='text' trim='true' name='link' id='link'
                        value='<?php echo $v['link']; ?>' style='width: 100%;'><br>
            Abstract (maximum 400 characters, no line breaks):<br>
            <textarea name='description' id='description' rows="10" cols="75"
                      onKeyDown="reformatTextArea(this, 400);"
                      onKeyUp="reformatTextArea(this, 400);"><?php echo $v['abstract']; ?></textarea><br>
            <br>
            <button type="submit">Save changes</button>
            <button type="button"
                    onClick="dijit.byId('edit-resource-dialog').hide();">Cancel</button>
        </form>
    </div>

    <?php
}

$logged_in = checkLogin();
if (!$logged_in) {
    header('Location: ngembryo.php');
} else {
    $rid = $_GET[rid];
    $user = $_SESSION['username'];

    $v = get_resource($user, $rid);
    if ($v["success"]) {
        return_form($v);
    } else {
        die_error(-3, "Invalid resource.");
    }
}
mysql_close($con);
?>

