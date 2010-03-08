<form dojoType='dijit.form.Form' name='cres' id='cres' method='post'>
    Author:<br>
    <input type='text' trim='true' name='author' id='author' value='' style='width: 300px;'><br>
    Title (maximum 40 characters):<br>
    <input type='text' trim='true' name='title' id='title' maxlength='40' value='' style='width: 300px;'><br>
    Abstract (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea><br>
    <button dojoType="dijit.form.Button" type="submit">OK</button>
    <button dojoType="dijit.form.Button" type="button" onClick="dijit.byId('create-resource-dialog').hide();">Cancel</button>
</form>
