<div class="form">
<form dojoType='dijit.form.Form' name='clay' id='clay' method='post'>
    <input type='hidden' trim='true' name='model' id='model' readonly='true' value='<?php echo ($_GET[model]); ?>'>
    <input type='hidden' trim='true' name='distance' id='distance' value='<?php echo ($_GET[distance]); ?>'>
    <input type='hidden' trim='true' name='yaw' id='yaw' value='<?php echo ($_GET[yaw]); ?>'>
    <input type='hidden' trim='true' name='pitch' id='pitch' value='<?php echo ($_GET[pitch]); ?>'>
    <input type='hidden' trim='true' name='roll' id='roll' value='<?php echo ($_GET[roll]); ?>'>
    Title (maximum 40 characters):<br>
    <input type='text' trim='true' name='title' id='title' maxlength='40' value='' style='width: 300px;'><br>
    Description (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea><br><br>
    <button type="submit">Create</button>
    <button type="button" onClick="dijit.byId('create-layer-dialog').hide();">Cancel</button>
</form>
</div>