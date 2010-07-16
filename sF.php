<div>
<div class="form">
<form dojoType='dijit.form.Form' name='search' id='search-form'
	method='get'>
<input type='hidden' name='type' id='type' value='0'>
<input type='hidden' name='start' id='start' value='0'>
<table style="width: 100%;">
	<tr>
		<td>
		Keyword: <input type='text' trim='true' name='key' id='key' maxlength='100'
			value='' style="width: 75%;" onChange="ngembryo.engine.__rss();"></td>
			<td align="right">Limit result: <select name="limit" onChange="ngembryo.engine.__GPSR();">
            <option value='10'>10</option>
            <option value='20'>20</option>
            <option value='50'>50</option>
        </select>
        <button type="submit">Search</button>
        <button type="button" onClick="dijit.byId('search-dialog').hide();">Cancel</button>
		</td>
	</tr>
</table>
</form>
</div>
<div id='search-result'></div>
</div>