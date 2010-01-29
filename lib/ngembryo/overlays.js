
/**
 * Not a very OO-style class: parasitic upon TileFrame.
 */
var Overlay = new Class({

	initialize: function(tileframe,model) {

		this.tileframe = tileframe;
		this.model = model;

	},


	requestMaps: function() {

		for (var j=this.tileframe.starty; j<=this.tileframe.endy; j++)
			for (var i=this.tileframe.startx; i<=this.tileframe.endx; i++)
				this.getMapForTile(i,j);
	},


	/**
	 * @author Chris Tindal
	 */
	getMapForTile: function(i, j) {

		if (i < 0 || i >= this.tileframe.xtiles || j < 0 || j >= this.tileframe.ytiles)
			return;

		var k = i + (j*this.tileframe.xtiles);
		var tileId = //'s' + this.model.scl.cur
		           //+ 'd' + this.model.dst.cur + 
							 'x' + i + 'y' + j;

		var overlayUrl = this.model.webpath+this.model.stackPath+this.model.overlayPath
			+this.model.filename
			+this.model.overlaySuffix+this.model.scl2res(this.model.scl.cur)
			+','+k+'.txt';
		this.model.getURL(overlayUrl, function(response)
			{
				var object = eval("("+response+")");
				this.createMapForTile(object, tileId);
			}.bind(this),
			true,
			false
		);

	},


	/**
	 * @author Chris Tindal
	 */
	createMapForTile: function(overlayData, tileId) {

		if (!overlayData)
			return;
    	
		var polyLines = overlayData.polylines;
		if (!polyLines)
			return;
			
		var mapElement = new Element( 'map', {
			'id': 'components_'+tileId,
			'name': 'components_'+tileId
		});
		mapElement.injectInside('tileframe');

		var domains = overlayData.domains;

		for(var i=0;i<polyLines.length;i++){
			
			var areaElement = new Element('area',
				{
					'shape':'poly',
					'coords':polyLines[i].coords,
					'id':polyLines[i].index+'_'+i+'_'+tileId,
					'name':'comp_'+i+'_'+tileId
				}
			);
			
			areaElement.addEvents( {
				'click': function(e) {
					// MooTools event abstraction
					var event = new Event(e);
					
					var indexValue = event.target.id.substring(0, event.target.id.indexOf('_'));
					var domainName = domains[indexValue-1].name;
					alert(this.model.anatomyTerms[domainName].name);
					//showComponentSummary(this.model.anatomyTerms[domainName].id);
					//openNodesMatchingComponentId(this.model.anatomyTerms[domainName].id);
				}.bindWithEvent(this),
				'mouseover': function(e) {
					// MooTools event abstraction
					var event = new Event(e);
					
					var indexValue = event.target.id.substring(0, event.target.id.indexOf('_'));
					var domainName = domains[indexValue-1].name;
					//alert(this.model.anatomyTerms[domainName].name);
					//$('termName').setHTML(this.model.anatomyTerms[domainName].name);
				}.bindWithEvent(this),
				'mouseout': function() {
					//$('termName').setHTML('none');
				}.bindWithEvent(this)
			});
			mapElement.appendChild(areaElement);		
		}	
	}

});

