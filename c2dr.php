<form dojoType='dijit.form.Form' name='c2dr' id='c2dr' method='post'>
	Polyline: <input type='text' name='polyline' id='polyline' value='<?php echo ($_GET[polyline]); ?>'>
	<br>
    Scale: <input type='text' trim='true' name='scale' id='scale' value='<?php echo ($_GET[scale]); ?>'>
    Distance: <input type='text' trim='true' name='dst' id='dst' value='<?php echo ($_GET[dst]); ?>'>
    <br>
    Yaw: <input type='text' trim='true' name='yaw' id='yaw' value='<?php echo ($_GET[yaw]); ?>'>
    Roll: <input type='text' trim='true' name='rol' id='rol' value='<?php echo ($_GET[rol]); ?>'>
    Pitch: <input type='text' trim='true' name='pit' id='pit' value='<?php echo ($_GET[pit]); ?>'>
    <br>
    Label (maximum 40 characters):<br>
    <input type='text' trim='true' name='label' id='label' maxlength='40' value='' style='width: 300px;'>
    <br>
    Description (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea>
    <br>
    <button dojoType="dijit.form.Button" type="submit">
        OK
    </button>
    <button dojoType="dijit.form.Button" type="button" onClick="dijit.byId('dialog').hide();">
        Cancel
    </button>
</form>
