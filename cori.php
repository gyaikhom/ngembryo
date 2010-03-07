<form dojoType='dijit.form.Form' name='cori' id='cori' method='post'>
    Model: <input type='text' trim='true' name='model' id='model' readonly='true' value='<?php echo ($_GET[model]); ?>'><br>
    Distance: <input type='text' trim='true' name='distance' id='distance' value='<?php echo ($_GET[distance]); ?>'><br>
    Yaw: <input type='text' trim='true' name='yaw' id='yaw' value='<?php echo ($_GET[yaw]); ?>'>
    Pitch: <input type='text' trim='true' name='pitch' id='pitch' value='<?php echo ($_GET[pitch]); ?>'>
    Roll: <input type='text' trim='true' name='roll' id='roll' value='<?php echo ($_GET[roll]); ?>'><br>
    Title (maximum 40 characters):<br>
    <input type='text' trim='true' name='title' id='title' maxlength='40' value='' style='width: 300px;'><br>
    Description (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea><br>
    <button dojoType="dijit.form.Button" type="submit">OK</button>
    <button dojoType="dijit.form.Button" type="button" onClick="dijit.byId('orientations-dialog').hide();">Cancel</button>
</form>
