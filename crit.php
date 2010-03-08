<form dojoType='dijit.form.Form' name='crit' id='crit' method='post'>
    Resource: <input type='text' trim='true' name='rid' id='rid' readonly='true' value='<?php echo ($_GET[rid]); ?>'><br>
    Mime: <input type='text' trim='true' name='mime' id='mime' value=''><br>
    Link: <input type='text' trim='true' name='link' id='link' value=''><br>
    Title (maximum 40 characters):<br>
    <input type='text' trim='true' name='title' id='title' maxlength='40' value='' style='width: 300px;'><br>
    Abstract (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea><br>
    <button dojoType="dijit.form.Button" type="submit">OK</button>
    <button dojoType="dijit.form.Button" type="button" onClick="dijit.byId('add-resource-item-dialog').hide();">Cancel</button>
</form>
