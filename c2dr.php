<div class="form">
<form dojoType='dijit.form.Form' name='c2dr' id='c2dr' method='post'>
    Layer: <input type='text' trim='true' name='lid' id='lid' value='<?php echo ($_GET[lid]); ?>'><br>
	Polyline: <input type='text' name='polyline' id='polyline' value='<?php echo ($_GET[polyline]); ?>'><br>
    Scale: <input type='text' trim='true' name='scale' id='scale' value='<?php echo ($_GET[scale]); ?>'>
    Label (maximum 40 characters):<br>
    <input type='text' trim='true' name='label' id='label' maxlength='40' value='' style='width: 300px;'><br>
    Description (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea>
    <br><br>
    <button type="submit">Create</button>
    <button dojoType="dijit.form.Button" type="button" onClick="dijit.byId('dialog').hide();">
        Cancel
    </button>
</form>
</div>