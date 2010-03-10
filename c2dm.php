<div class="form">
<form dojoType='dijit.form.Form' name='c2dm' id='c2dm' method='post'>
Layer: <input type='text' trim='true' name='lid' id='lid' value='<?php echo ($_GET[lid]); ?>'><br></br>
X:<input type='text' trim='true' name='x' id='x' value='<?php echo ($_GET[x]); ?>'>
Y: <input type='text' trim='true' name='y' id='y' value='<?php echo ($_GET[y]); ?>'> <br>
Scale: <input type='text' trim='true' name='scale' id='scale' value='<?php echo ($_GET[scale]); ?>'><br>
Label (maximum 40 characters):<br>
<input type='text' trim='true' name='label' id='label' maxlength='40'
	value='' style='width: 300px;'> <br>
Description (maximum 400 characters, no line breaks):<br>
<textarea name='description' id='description' rows="10" cols="75"
	onKeyDown="reformatTextArea(this, 400);"
	onKeyUp="reformatTextArea(this, 400);"></textarea> <br>
<button dojoType="dijit.form.Button" type="submit">OK</button>
<button dojoType="dijit.form.Button" type="button"
	onClick="dijit.byId('dialog').hide();">Cancel</button>
</form>
</div>