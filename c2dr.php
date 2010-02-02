<form dojoType='dijit.form.Form' name='c2dr' id='c2dr' method='post'>
	Polyline: <input type='text' name='polyline' id='polyline' value='<?php echo ($_GET[polyline]); ?>'>
	<br>
    Scale: <input type='text' dojoType='dijit.form.TextBox' trim='true' name='scale' id='scale' value='<?php echo ($_GET[scale]); ?>'>
    Distance: <input type='text' dojoType='dijit.form.TextBox' trim='true' name='dst' id='dst' value='<?php echo ($_GET[dst]); ?>'>
    <br>
    Yaw: <input type='text' dojoType='dijit.form.TextBox' trim='true' name='yaw' id='yaw' value='<?php echo ($_GET[yaw]); ?>'>
    Roll: <input type='text' dojoType='dijit.form.TextBox' trim='true' name='rol' id='rol' value='<?php echo ($_GET[rol]); ?>'>
    Pitch: <input type='text' dojoType='dijit.form.TextBox' trim='true' name='pit' id='pit' value='<?php echo ($_GET[pit]); ?>'>
    <br>
    Label: <input type='text' dojoType='dijit.form.TextBox' trim='true' name='label' id='label' maxlength='255' value='' style='width: 100%;'>
    <br>
    Description:
    <textarea dojoType="dijit.form.Textarea" name='description' id='description'></textarea>
    <br>
    <button dojoType="dijit.form.Button" type="submit">
        OK
    </button>
    <button dojoType="dijit.form.Button" type="button" onClick="dijit.byId('dialog').hide();">
        Cancel
    </button>
</form>
