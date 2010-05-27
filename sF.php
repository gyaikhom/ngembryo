<div class="form">
<form dojoType='dijit.form.Form' name='search' id='search-form'
	method='get'>

<table style="width: 100%;">
	<tr>
		<td>Category:</td>
		<td><input type="radio" name="type" value="marker"> Marker</td>
		<td><input type="radio" name="type" value="region"> Region</td>
		<td><input type="radio" name="type" value="layer"> Layer</td>
		<td><input type="radio" name="type" value="resource"> Resource</td>
	</tr>
	<tr>
		<td colspan="5"><br>
		<input type='text' trim='true' name='key' id='key' maxlength='100'
			value='' style='width: 100%;'><br>
		<br>
		</td>
	</tr>
	<tr>
		<td colspan="4">Limit result: <select name="limit">
			<option value='10'>10</option>
			<option value='20'>20</option>
			<option value='50'>50</option>
		</select></td>
		<td align="right">
		<button type="submit">Search</button>
		<button type="button" onClick="dijit.byId('search-dialog').hide();">Cancel</button>
		</td>
	</tr>
</table>
</form>
</div>
