<div class="form">
<form dojoType='dijit.form.Form' name='crit' id='crit' method='post'>
    <input type='hidden' trim='true' name='rid' id='rid' readonly='true' value='<?php echo ($_GET[rid]); ?>'>
    Mime-type: 
    <select name='mime' id='mime'>
		<option value='text/plain'>txt</option>
		<option value='text/html'>html, htm</option>
		<option value='application/msword'>doc</option>
		<option value='application/powerpoint'>ppt</option>
    	<option value='application/pdf'>pdf</option>
		<option value='application/postscript'>eps, ps</option>
		<option value='application/rtf'>rtf</option>
    	<option value='application/zip'>zip</option>
    	<option value='image/jpeg'>jpeg, jpg, jpe</option>
    	<option value='image/png'>png</option>
		<option value='image/gif'>gif</option>
		<option value='image/tiff'>tiff, tif</option>
		<option value='video/mpeg'>mpeg, mpg, mpe</option>
		<option value='video/quicktime'>qt, mov</option>
		<option value='video/x-msvideo'>avi</option>
		<option value='video/x-sgi-movie'>movies</option>
    	<option value='audio/mpeg'>mpga, mp2</option>
    	<option value='audio/x-wav'>wav</option>
		<option value='audio/x-pn-realaudio'>ram</option>
		<option value='audio/x-realaudio'>ra</option>
    	<option value='application/x-tar'>tar</option>
		<option value='application/x-gtar'>gtar</option>
		<option value='application/x-gzip'>gzip, gz</option>
    	<option value='application/x-dvi'>dvi</option>
   		<option value='application/x-latex'>latex</option>
   	 	<option value='application/x-tex'>tex</option>
    	<option value='application/x-texinfo'>texinfo, texi</option>
    	<option value='application/x-troff-man'>man</option>
		<option value='audio/x-aiff'>aif, aiff, aifc</option>
		<option value='image/ief'>ief</option>
		<option value='image/x-portable-anymap'>pnm</option>
		<option value='image/x-portable-bitmap'>pbm</option>
		<option value='image/x-portable-graymap'>pgm</option>
		<option value='image/x-portable-pixmap'>ppm</option>
		<option value='image/x-xbitmap'>xbm</option>
		<option value='image/x-xpixmap'>xwb</option>
		<option value='image/x-xwindowdump'>xwd</option>
		<option value='text/richtext'>rtx</option>
		<option value='text/x-sgml'>sgml, sgm</option>
	</select>
    
    <br>
    URI: <input type='text' trim='true' name='link' id='link' value='http://' style='width: 100%;'><br>
    Title (maximum 40 characters):<br>
    <input type='text' trim='true' name='title' id='title' maxlength='40' value='' style='width: 100%;'><br>
    Abstract (maximum 400 characters, no line breaks):<br>
    <textarea name='description' id='description' rows="10" cols="75" onKeyDown="reformatTextArea(this, 400);" onKeyUp="reformatTextArea(this, 400);"></textarea><br><br>
    <button type="submit">Create</button>
    <button type="button" onClick="dijit.byId('add-resource-item-dialog').hide();">Cancel</button>
</form>
</div>