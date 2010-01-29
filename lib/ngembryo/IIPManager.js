/**
 * @classDescription This encapsulates an IIP manager (based on Woolz IIP Viewer).
 * @author gyaikhom
 * @version 0.0.1
 */

/*
	Woolz IIP Viewer
	Copyright (c) 2008 Tom Perry    <Tom.Perry@hgu.mrc.ac.uk>
	                   Chris Tindal <Chris.Tindal@hgu.mrc.ac.uk>
			   Mei Sze Lam <meiszel@hgu.mrc.ac.uk>
	
	for use with the HGU Woolz IIP server:
										 Zsolt Husz   <Zsolt.Husz@hgu.mrc.ac.uk>

	based on IIPImage Javascript Viewer <http://iipimage.sourceforge.net>
											Version 1.0
	Copyright (c) 2007 Ruven Pillay <ruven@users.sourceforge.net>

	Built using the Mootools javascript framework <http://www.mootools.net>

	-------
	History
	-------

	This code has its roots in around five different approaches to a Javascript
	IIP viewer.  The first was Ruven Pillay's original viewer, which I extended
	in 2006 for use by various projects in the MRC HGU including EuReGene
	(http://www.euregene.org) and Eurexpress (http://www.eurexpress.org/).  This
	codebase was modified by members of these projects for their own purposes and
	can currently be seen running on their respective websites.

	One branch reached the Sanger Institute, where it was incorporated into the
	EmbryoExpress project (http://www.embryoexpress.org/)

	Meanwhile, Ruven Pillay had been working on an updated version of his IIP
	viewer, which was released in 2007.  When returning to the MRC HGU in 2008 to
	work on the IIP viewer again, I decided to use this as the foundation for future
	versions of the client, and attempted to incorporate some of the various changes
	made by other users, including Chris Tindal's work on overlays.

	Tom Perry, August 2008


	-----
	Notes
	-----
	* Requires mootools version 1.2 <http://www.mootools.net>
	* The page must have a standards-compliant XHTML declaration at the beginning
	* Code is formatted so as to conform to local coding standards:
			http://aberlour.hgu.mrc.ac.uk/Twiki/bin/view/MouseAtlas/JavaStandards


	-------
	Licence
	-------

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA	02111-1307	USA

	----
	TODO
	----

	* Merge notifications
	* Nav window bugs
	* Key scrolling / arrow key handling

	---------------------------------------------------------------------------
*/


/********************************************************************
 * 'Static' functions and variables
 *******************************************************************/


/**
 * Common code used to initialise MooTools drag classes.
 */
function getDragOpts(container, updateDelay, bind, handle)
{
	return {
		container: container,
		snap: 0,
		handle: handle,
		onStart: function()
						{
							this.dragging = false;
							this.updateDelay = updateDelay;//milliseconds
						}.bind(bind),
		onDrag: function()
						{
							if (!this.dragging)
							{
								this.handleDrag(false);
								if (this.updateDelay != 0)
								{
									this.dragging = true;
									setTimeout(function() {
										this.dragging = false;
									}.bind(bind) ,this.updateDelay);
								}
							}
						}.bind(bind),
		onComplete: function()
						{
							this.handleDrag(true);
						}.bind(bind)
	};
}

var typeEnum = new Object({
	loading:0,
	scroll:1,
	viewport:2,
	scl:3,
	dst:4,
	pit:5,
	yaw:6,
	rol:7,
	pitquiet:8,
	yawquiet:9,
	sel:10,
	all:11,
	dstquiet:12,
	context:13, //maze update contextmenu
	ovl:14 //maze overlays
});



/********************************************************************
 * Main classes
 *******************************************************************/

var WlzIIPViewer = new Class({

	initialize: function(options) {

		window.addEvent( 'domready', function() {

// 			$(options.source).style.width  = window.getWidth() + "px";
// 			$(options.source).style.height = window.getHeight() + "px";

			this.model = new Model(options.server,options.stack,options.webpath,options.fspath,options.assayid,options.initialdst);


			document.addEvent( 'mousewheel', this.mouseZoom.bindWithEvent(this) );
// 			document.addEvent( 'contextmenu', this.replaceContextMenu.bindWithEvent(this) );
//			document.addEvent( 'click', this.hideContextMenu.bindWithEvent(this) );	

			window.addEvent( 'resize', function() {
					this.model.setViewportSize(window.getWidth(),window.getHeight());
				}.bind(this));
			document.body.style.overflow = 'hidden'; 
			document.documentElement.style.overflow = "hidden"; /*maze: ie bug fix -
			some versions of ie have the scroll property in <html> instead of <body>*/

			if (options.loading.enable)
				new LoadingFrame(options.source,this.model);

			if (options.tileframe.enable)
				new TileFrame(options.source,this.model); 

			if (options.overlay.enable)
				this.overlayer = new OverlayTileFrame(options.source, this.model, options.overlay.path, options.overlay.name, true, false);

			if (options.annotation.enable){
				alert('Right click to switch labels off/on!');
				this.annolayer = new OverlayTileFrame(options.source, this.model, options.annotation.path, options.annotation.name, false, true);
			}

			if (options.locator.enable)
				new Locator( "roiControl", options.server, this.model);

			if (options.sectionplane.enable)
				this.sectionPlane = new SectionPlane("secControl", options.server, this.model,
						options.sectionplane);

			if (options.dstslider.enable)
				new VarSlider(options.source, this.model, 'dst',
						this.model.dst, [typeEnum.dst, typeEnum.dstquiet], true, true, false,
						options.dstslider, options.sliders)
					.window.setPosition(options.dstslider.pos[0],options.dstslider.pos[1]);

			if (options.zoomslider.enable)
				new VarSlider(options.source, this.model, 'scl',
						this.model.scl, [typeEnum.scl, typeEnum.sclextents], true, false, false,
						options.zoomslider, options.sliders)
					.window.setPosition(options.zoomslider.pos[0],options.zoomslider.pos[1]);

			if (options.overlayslider.enable)
				new VarSlider(options.source, this.model, 'ovl',
						this.model.ovl, [typeEnum.ovl], false, false, true,
						options.overlayslider, options.sliders)
					.window.setPosition(options.overlayslider.pos[0],options.overlayslider.pos[1]);

			if (options.selector.enable)
				new Selector(options.source, options.server, 'Selector', this.model,
						options.selector.maxSize[0], options.selector.maxSize[1])
					.window.setPosition(options.selector.pos[0],options.selector.pos[1]);

			if (options.debugwin.enable)
				new VarWin(options.source, this.model)
					.window.setPosition(options.debugwin.pos[0],options.debugwin.pos[1]);

// 			if (options.contextmenu.enable)
// 				this.contextmenu = new ContextMenu(options.source, options.contextmenu, options, this.model, this.annolayer, [typeEnum.dst, typeEnum.dstquiet, typeEnum.annotation]);
			
			this.model.getMetadata(options.stack); //maze: moo thumbnail gallery needs to be after metadata to get the array of thumbnail images

			if (options.gallery.enable)
				new Gallery(options.source, options.server, 'Gallery', this.model, options.gallery)
					.window.setPosition(options.gallery.pos[0], options.gallery.pos[1]);
	
			}.bind(this)); 
	},


	/* 
	 * @author Maze 
	 */
// 	replaceContextMenu: function( e ){
// 		e.stop();
// 		this.contextmenu.showMenu(e);
// 	},

// 	hideContextMenu: function( e ){
// 		if ( !e.rightClick ) {
// 			this.contextmenu.hideMenu(e); 
// 		}
// 	},

	/*
	 * @author Ruven Pillay, Tom Perry
	 */
	mouseZoom: function( e ) {

		var event = new Event(e);
		var newscl;

		if( event.wheel > 0 ) // for mouse scrolls
			newscl = this.model.scl.cur * 2;
		else if( event.wheel < 0 )
			newscl = this.model.scl.cur / 2;
		else if(event.shift) // for double clicks
			newscl = this.model.scl.cur / 2;
		else
			newscl = this.model.scl.cur * 2;

		this.model.setVals(['scl'],[newscl],false,'mouse');
	},



	/**
	 * Keyboard scrolling/zooming.
	 *
	 * @author Tom Perry
	 */
	onKeyDown: function(e) {

		/*
		 * If we're already scrolling, interrupt this action and
		 * handle the new keypress
		 */
		if (this.scrolling)
			clearTimeout(this.timeout);

		//alert(e);

		/*
		var obj = new Object({
			scroll: new Object()
		});

		obj.scroll.x = this.model.viewport.x;
		obj.scroll.y = this.model.viewport.y;
		*/

		// Ugly...
		switch( e.code )
		{
			/*
			case 37: // left
			case 100:
				obj.type = 'scroll';
				this.scrollParms.xinc = -1;
				this.scrollParms.yinc = 0;
				break;
			case 38: // up
			case 104:
				obj.type = 'scroll';
				this.scrollParms.xinc = 0;
				this.scrollParms.yinc = -1;
				break;
			case 39: // right
			case 102:
				obj.type = 'scroll';
				this.scrollParms.xinc = 1;
				this.scrollParms.yinc = 0;
				break;
			case 40: // down
			case 98:
				obj.type = 'scroll';
				this.scrollParms.xinc = 0;
				this.scrollParms.yinc = 1;
				break;
			case 103: // up-left
				obj.type = 'scroll';
				this.scrollParms.xinc = -0.707;
				this.scrollParms.yinc = -0.707;
				break;
			case 105: // up-right
				obj.type = 'scroll';
				this.scrollParms.xinc = 0.707;
				this.scrollParms.yinc = -0.707;
				break;
			case 97: // down-left
				obj.type = 'scroll';
				this.scrollParms.xinc = -0.707;
				this.scrollParms.yinc = 0.707;
				break;
			case 99: // down-right
				obj.type = 'scroll';
				this.scrollParms.xinc = 0.707;
				this.scrollParms.yinc = 0.707;
				break;
				*/
			case 107: // plus
				if(!e.control)
				{
					if (e.shift)
						this.model.dst.increment();
					else
						this.model.scl.increment();
				}
				break;
			case 109: // minus
				if(!e.control) 
				{
					if (e.shift)
						this.model.dst.decrement();
					else
						this.model.scl.decrement();
				}
				break;
			default:
				return;
		}
		
		/*
		if (obj.type == 'scroll')
		{
			this.keyDown = true;
			this.scrolling = true;
			this.loop(obj);
		}
		*/
	},



	/*
	 * Accelerates/decelerates rate of scrolling when using the
	 * arrow keys
	 *
	 * @author Tom Perry
	 */
	loop: function(obj) {

		this.scrollParms.x = this.scrollParms.xinc * this.scrollParms.speed;
		this.scrollParms.y = this.scrollParms.yinc * this.scrollParms.speed;
		
		obj.scroll.x += this.scrollParms.x;
		obj.scroll.y += this.scrollParms.y;

		if (obj.scroll.x < 0) obj.scroll.x = 0;
		if (obj.scroll.y < 0) obj.scroll.y = 0;
		if (obj.scroll.x >= this.model.image.width - this.model.viewport.width)
			obj.scroll.x = this.model.image.width - this.model.viewport.width;
		if (obj.scroll.y >= this.model.image.height - this.model.viewport.height)
			obj.scroll.y = this.model.image.height - this.model.viewport.height;

		this.scrollEvent.fire(obj.trigger,obj.scroll.x,obj.scroll.y);

		if (this.keyDown)
		{
			if (this.scrollParms.speed < this.scrollParms.maxSpeed)
				this.scrollParms.speed += this.scrollParms.accel;
			this.timeout = setTimeout(function(){iip.loop(obj);},this.scrollParms.tick);
		}
		else
		{
			this.scrollParms.speed -= this.scrollParms.decel;
			if (this.scrollParms.speed > 0)
				this.timeout = setTimeout(function(){iip.loop(obj);},this.scrollParms.tick);
			else
			{
				this.scrolling = false;
				this.scrollParms.speed = 0;
			}
		}
	},



	onKeyUp: function() {
		this.keyDown = false;
	}

});


var Model = new Class({

	initialize: function(server,filename,webpath,fspath,assayid,initialdst) {

		this.registry = new Array();
		this.server = server;
		this.webpath = webpath;
		this.fspath = fspath;
		this.assayid = assayid; //maze
		this.initialdst = initialdst;

		this.waiters = 0;

		this.image = new Object();
		this.tileSize = new Object();
		this.viewport = new Object();
		this.setViewportSize(window.getWidth(),window.getHeight());
		this.viewable = new Object();
		this.fullWlzObject = new Object();
		this.fullWlzObject.x = new Object();
		this.fullWlzObject.y = new Object();
		this.fullWlzObject.z = new Object();
		this.fullImage = new Object();
		this.zsel = new Object();
		this.mode = 'zeta';
		this.fxp = new Object();
		this.fxp.x = 0;
		this.fxp.y = 0;
		this.fxp.z = 0;

		this.scl = new Object();
		this.scl.iipmin = 0;
		this.scl.winmin = 0;
		this.scl.increment = function() {
			this.setVals(['scl'],[ this.scl.cur * 2 ],false,'unknown');
		}.bind(this);
		this.scl.decrement = function() {
			this.setVals(['scl'],[ this.scl.cur / 2 ],false,'unknown');
		}.bind(this);

		this.dst = new Object();
		this.dst.min = 0;
		this.dst.max = 0;
		if ( $defined(initialdst) && !isNaN( parseInt( initialdst, 10 ) ) )
			this.dst.cur = parseInt( initialdst, 10 ) - 1; //minus 1 to account for eurexpress image indexes starting from 1 instead of 0 like in a normal array
		this.dst.increment = function() {
			this.setVals(['dst'],[ this.dst.cur + 1 ],false,'unknown');
		}.bind(this);
		this.dst.decrement = function() {
			this.setVals(['dst'],[ this.dst.cur - 1 ],false,'unknown');
		}.bind(this);

		this.ovl = new Object();
		this.ovl.cur = 0.6;
		this.ovl.min = 0.1;
		this.ovl.max = 1;
		this.ovl.inc = 0.1;
		this.ovl.increment = function(){
			this.setVals(['ovl'], [ this.ovl.cur + 0.1 ], false, 'unknown');
		}.bind(this);
		this.ovl.decrement = function(){
			this.setVals(['ovl'], [ this.ovl.cur - 0.1 ], false, 'unknown');
		}.bind(this);
		

		this.pit = new Object();
		this.pit.min = 0;
		this.pit.max = 180;
		this.pit.cur = 0;
		this.yaw = new Object();
		this.yaw.min = 0;
		this.yaw.max = 360;
		this.yaw.cur = 0;
		this.rol = new Object();
		this.rol.min = 0;
		this.rol.max = 360;
		this.rol.cur = 0;
		this.qlt = new Object();
		this.qlt.min = 0;
		this.qlt.max = 100;
		this.qlt.cur = 80;
		this.roi = new Object();
		this.roi.x = 0.5;
		this.roi.y = 0.5;
		this.hasZSel = false;

		this.waiters++;
		this.notify([typeEnum.loading]);
	},

	attach: function(observer,types) {

		this.registry.push(new Object({component: observer, types: types}));
	},

	/*
	detach: function(observer)
	{
		var i = 0;
		var found = false;
		while (!found && $defined(this.registry[i]))
		{
			if (this.registry[i].component == observer)
			{
				this.registry.splice(i);
				found = true;
			}
			i++;
		}
	},
	*/

	notify: function(types, trigger) {
		
		//alert(types);
		for (var i = 0; i < this.registry.length; i++)
		{
			var found = false;
			var j = 0;
			while (!found && j < types.length)
			{
				if (types[j] == typeEnum.all || this.registry[i].types.indexOf(types[j]) != -1)
				{
					found = true;
					this.registry[i].component.update(types, trigger);
				}
				j++;
			}
		}
	},


	/**
	 * Requests data at some address and passes the response into a
	 * callback function provided in the function parameters.
	 *
	 * @author Tom Perry
	 *
	 * @param url         The url to load.
	 * @param callback    The function into which the response should
	 *                    be fed.
	 * @param failQuietly If false or undefined, an alert will
	 *                    appear if the data cannot be loaded.  If
	 *                    true, no alert will appear.
	 * @param async       If true or undefined, the request will be
	 *                    asynchronous.  If false, the request will
	 *                    be synchronous (i.e. will block)
	 */
	getURL: function(url, callback, failQuietly, async, isMetadata) {
		if (!$defined(async))
			async = true;
		
		//maze: add isMetadata for allowing .js metadata files containing non-statements to bypass function $exec in mootools.core
		if (!$defined(isMetadata))
			isMetadata = false; //default is false unless explicitly stated by user that it is a metadata file

		new Request(
			{
				isMetadata: isMetadata, //maze
				url: url,
				method: 'get',
				async: async,
				onSuccess: function(transport)
				{
					var response = transport || "No response from server ";
					callback(response);
				}.bind(this),
				onFailure: function()
				{
					if(!$chk(failQuietly))
						alert('Unable to fetch data at "'+url+'"');
				}
			}
		).send();
	},



	/*
	 * Requests IIP objects from an IIP server.
	 *
	 * Object names are passed in an array, an Ajax request is sent
	 * to the server and corresponding values are passed to the
	 * callback function.
	 *
	 * A loading animation will be displayed if the request takes a
	 * while, because Woolz objects may need to be loaded from disk
	 * on the server.
	 *
	 * @author Tom Perry
	 *
	 * @param objs     An array of object names to load.
	 * @param callback The function into which the values
	 *                 corresponding to the requested objects
	 *                 should be fed.
	 * @param async    If true or undefined, the request will be
	 *                 asynchronous.  If false, the request will
	 *                 be synchronous (i.e. will block)
	 */
	getObjects: function( objs, callback, async ) {

		if (!objs[0])
			callback();

		var url;

		if (this.wlz)
			url = this.server + "?" + this.fif
					+ "&mod=" + this.mode
					+ "&fxp=" + this.fxp.x + ',' + this.fxp.y + ','+ this.fxp.z
					+ "&dst=" + this.dst.cur
					+ "&pit=" + this.pit.cur
					+ "&yaw=" + this.yaw.cur
					+ "&rol=" + this.rol.cur;
		else
			url = this.server + "?" + this.fif;
		
		
		for (var i = 0; i < objs.length; i++)
		{
			if (objs[i] == "Resolution-number" && this.wlz)
				alert("Error: Resolution-number IIP object not supported for Woolz objects.");
			if (objs[i] == "Wlz-distance-range" && !this.wlz)
				alert("Error: Wlz-distance-range IIP object not supported for non-Woolz objects.");

			url += "&obj=" + objs[i];

			// Hack for 'IIP' object
			if (objs[i] == "IIP")
				url += ",1.0";
		}

		this.waiters++;
		this.notify([typeEnum.loading]);

		this.getURL(url,function(response)
			{
				this.waiters--;
				this.notify([typeEnum.loading]);

				var vals = new Array(objs.length);
				vals[0] = response.split(objs[0]+":")[1];

				// Iteratively chop up the response
				for (var i = 0; i < objs.length-1; i++)
				{
					if (!vals[i])
					{
						if (response.split("\r")[0] == "Error/7:1 3 FIF")
							alert("Cannot load image data from "+this.fif.split("fif=")[1]);
						else if (response.split("\r")[0] == "Error/7:2 2 wlz")
							alert("Cannot load Woolz data: unsupported by server.");
						else
							alert("Unexpected response from IIP server:\n"+response);
						return;
					}
					vals[i+1] = vals[i].split(objs[i+1]+":")[1];
					vals[i] = vals[i].split(objs[i+1]+":")[0].split("\r")[0];
				}

				for (var i = 0; i < objs.length; i++)
				{
					switch(objs[i])
					{
						case "Max-size":
							this.fullImage.width  = parseInt( vals[i].split(" ")[0] );
							this.fullImage.height = parseInt( vals[i].split(" ")[1] );
							this.setWinMinScl();
							break;
						case "Resolution-number":
							this.maxiipres = parseInt( vals[i] ) - 1;
							this.setIIPMinScl();
							break;
						case "Wlz-distance-range":
							this.dst.min = parseInt( vals[i].split(" ")[0] );
							this.dst.max = parseInt( vals[i].split(" ")[1] );
							if (this.dst.cur < this.dst.min) this.dst.cur = this.dst.min;
							if (this.dst.cur > this.dst.max) this.dst.cur = this.dst.max;
							break;
						case "Wlz-3d-bounding-box":
							this.fullWlzObject.z.min = parseInt( vals[i].split(" ")[0] );
							this.fullWlzObject.z.max = parseInt( vals[i].split(" ")[1] );
							this.fullWlzObject.y.min = parseInt( vals[i].split(" ")[2] );
							this.fullWlzObject.y.max = parseInt( vals[i].split(" ")[3] );
							this.fullWlzObject.x.min = parseInt( vals[i].split(" ")[4] );
							this.fullWlzObject.x.max = parseInt( vals[i].split(" ")[5] );
							break;
						case "Tile-size":
							this.tileSize.width  = parseInt( vals[i].split(" ")[0] );
							this.tileSize.height = parseInt( vals[i].split(" ")[1] );
							break;
					}
				}

				callback(vals);
			}.bind(this),
			false,
			async
		);
	},



	/**
	 * Since a (non-Woolz) stack is simply a collection of images,
	 * we need an extra metadata file to store information on the
	 * stack as a whole that cannot be determined from IIP objects
	 * which describe individual images.
	 *
	 * We store this metadata in JSON format in the server's
	 * filesystem and load it here.
	 *
	 * @author Tom Perry
	 *
	 * @param filename The location of the image stack on the
	 *                 server.  If the file is a Javascript
	 *                 metadata object, the path is relative to the
	 *                 web root; if it's a Woolz object, the path
	 *                 is an absolute location on the server's
	 *                 filesystem.
	 */
	getMetadata: function(filename) {

		switch (filename.length)
		{
			case (filename.lastIndexOf(".wlz") + 4):
				// If *.wlz, get metadata from IIP server
				this.wlz = true;
				this.scl.max = 4;
				if (!$defined(this.fif))
					this.fif = "wlz="+filename;
				this.getIIPMetadata();
				break;
			case (filename.lastIndexOf(".tif.js") + 7): //maze: image file names specified by images in old metadata file
			case (filename.lastIndexOf(".tif") + 4):
			case (filename.lastIndexOf(".tiff") + 5):
				// If *.tif, get metadata from IIP server
				this.wlz = false;
				this.scl.max = 1;
				if (!$defined(this.fif))
					this.fif = "fif="+filename;
				this.getIIPMetadata();
				break;
			case (filename.lastIndexOf(".js") + 3):
				// If *.js, parse JS object
				this.getURL(filename,
					function(response)
					{
						if (!response)
						{
							alert("Could not load stack metadata");
							return;
						}

						var jso = eval("("+response+")");

						var meta_ver = "1.0"; //default
						if ($chk(jso.metadata_version))
							meta_ver = jso.metadata_version;

						switch (meta_ver)
						{
							case "1.0":
								//this.imgpaths = jso.image;
								if ( $chk(this.assayid) ){ 
									this.imgarr = new Array();
									if ($chk(jso.image)){
										for ( var i = 0; i < jso.image.length; i++ ){
											if ( jso.image[i].jsopath.length == jso.image[i].jsopath.lastIndexOf(".js")+3 )
												this.imgarr.push( jso.image[i].jsopath.substring(0, jso.image[i].jsopath.length-3) );
											else
												this.imgarr.push( jso.image[i].jsopath );
										}
										this.imgpaths = this.imgarr;
										this.dst.max = this.imgpaths.length - 1;
									} 
									else
									{
										alert("No images defined in JS file");
										return;
									}
									
									if (!$defined(this.dst.cur)
										|| this.dst.cur > this.dst.max
										|| this.dst.cur < this.dst.min)
									{
										this.dst.cur = Math.round(this.dst.min + (this.dst.max - this.dst.min)/2);
									}

									var folderno = parseInt( this.assayid.substring(9, 13), 10 );
									this.stackPath = "ee_maze/" + folderno + "/" + this.assayid + "/"; //ee_maze on aberlour, ee_stacks on arran
									this.imageExtension = "";
								}
								/*else
								{
									var tmp = this.imgpaths[Math.round(this.dst.cur)].jsopath;
									this.filename = tmp.substring(0,tmp.indexOf('.js'));
								}*/
								else
								{
									alert("Old version of of metadata JS file cannot be loaded");
								}
								this.getfif = function()
								{
									this.filename = this.imgpaths[Math.round(this.dst.cur)];
									return 'fif='+this.fspath+this.stackPath
										+'images/'+this.filename;
								}.bind(this);
								break;
							case "1.1":
								if ($chk(jso.image))
								{
									this.imgpaths = jso.image;
								}
								else
								{
									alert("No images defined in JS file");
									return;
								}
									
								if ($chk(jso.image.length))
									this.dst.max = jso.image.length - 1;

								if (!$defined(this.dst.cur)
										|| this.dst.cur > this.dst.max
										|| this.dst.cur < this.dst.min)
								{
									this.dst.cur = Math.round(this.dst.min + (this.dst.max - this.dst.min)/2);
								}

								this.stackPath = jso.stackpath;
								this.getfif = function()
								{
									this.filename = this.imgpaths[Math.round(this.dst.cur)];
									return 'fif='+this.fspath+this.stackPath
										+'images/'+this.filename;
								}.bind(this);
								this.imageExtension = "";
								break;
							case "1.12": //maze format developed for adding different images (eg a collection) to a gallery as opposed to sections of the same stack
								if ($chk(jso.image))
								{
									this.imgpaths = jso.image;
									this.overlaypaths = jso.overlay;
									this.annopaths = jso.annotation;
								}
								else
								{
									alert("No images defined in JS file");
									return;
								}
									
								if ($chk(jso.image.length))
									this.dst.max = jso.image.length - 1;

								if (!$defined(this.dst.cur)
										|| this.dst.cur > this.dst.max
										|| this.dst.cur < this.dst.min)
								{
									this.dst.cur = Math.round(this.dst.min + (this.dst.max - this.dst.min)/2);
								}

								this.stackPath = jso.stackpath;
								this.getfif = function()
								{
									this.filename = this.imgpaths[Math.round(this.dst.cur)];
									return 'fif='+this.fspath+this.stackPath
										+'images/'+this.filename;
								}.bind(this);
								this.getovlfif = function()
								{
									this.ovlfilename =  this.overlaypaths[Math.round(this.dst.cur)];
									return 'fif='+this.fspath+this.stackPath
										+'images/'+this.ovlfilename;
								}.bind(this);
								this.imageExtension = "";
								break;
							case "1.02":
								if ($chk(jso.file_root))
									this.imgpaths = jso.file_root;
								else
								{
									alert("No images defined in JS file");
									return;
								}
									
								if ($chk(jso.file_root.length))
									this.dst.max = jso.file_root.length - 1;

								if (!$defined(this.dst.cur)
										|| this.dst.cur > this.dst.max
										|| this.dst.cur < this.dst.min)
								{
									this.dst.cur = Math.round(this.dst.min + (this.dst.max - this.dst.min)/2);
								}

								this.stackPath = jso.stackpath;
								this.imagePath = jso.imagepath;
								this.imageExtension = jso.image_extension;
								if ($chk(jso.overlaypath))
								{
									this.hasOverlays = true;
									this.overlayPath = jso.overlaypath;
									this.overlaySuffix = jso.overlaysuffix;
								}
								this.getfif = function()
								{
									this.filename = this.imgpaths[Math.round(this.dst.cur)];
									return 'fif='+this.fspath+this.stackPath
										+'images/'+this.filename + this.imageExtension;
								}.bind(this);
								break;
						}

						if ($chk(jso.zselwidth) && $chk(jso.zselheight) && $chk(jso.zsliceorientation))
						{
							this.zsel.width = jso.zselwidth;
							this.zsel.height = jso.zselheight;
							this.zsel.border_tl = jso.zseldragborderlefttop;
							this.zsel.border_br = jso.zseldragborderrightbottom;
							this.zsel.orientation = jso.zsliceorientation;
							this.selsrc = this.webpath+this.stackPath+jso.zsimgsrc;
							this.hasZSel = true;
						}

						if ($chk(jso.domain_mapping))
						{
							this.getURL(jso.domain_mapping,
								function(response) { 
									this.anatomyTerms = eval("("+response+")");
								}.bind(this),
								false,
								false
							);
						}

						this.fif = this.getfif();
						this.getMetadata(this.filename + this.imageExtension);
					}.bind(this),
					false,
					false,
					true //isMetadata
				);
				break;
			default:
				alert("Invalid image resource:\n" + filename);
				break;
		}
	},

	/**
	 * Requests all relevant data that is accessible via the IIP
	 * server (i.e. not data that is stored in metadata files,
	 * which is requested by getStack() )
	 *
	 * @author Ruven Pillay/Tom Perry
	 */
	getIIPMetadata: function() {

		/*
		this.setViewportSize();
		this.createSliders();
		this.locator = new Locator(this.source, this.server, this.navigationEvent, this.scrollEvent, this.zoomEvent, this.geometryEvent);
		this.locator.window.setPosition(this.model.viewport.width - 400,30);
		this.selector = new Selector(this.source, this.navigationEvent);
		if (this.wlz)
		{
			this.selector.window.setPosition(this.model.viewport.width - 400,300);
			this.sectionplane = new SectionPlane(this.source,this.server,this.navigationEvent);
			this.sectionplane.window.setPosition(this.model.viewport.width - 600,400);
		}
		else
		{
			this.selector.window.setPosition(this.model.viewport.width - this.zsel.width - 30,300);
		}
		if ($defined(this.zsel.width)
			&& $defined(this.zsel.height))
			this.selector.setSize(this.zsel.width,this.zsel.height);
		this.selector.setSrc(this.selsrc);
		//this.carousel = new Carousel(this.source, this.server);
		window.addEvent( 'resize', this.onWindowResize.bindAsEventListener(this));
		this.navigationEvent.subscribe(this.onNavigationEvent, this);
		this.scrollEvent.subscribe(this.onScrollEvent, this);
		this.zoomEvent.subscribe(this.onZoomEvent, this);
		this.geometryEvent.subscribe(this.onGeometryEvent, this);
		*/

		/*
		this.everythingEvent.fire({
				'max_width': this.max_width,
				'max_height': this.max_height,
				'model.viewport.width': this.model.viewport.width,
				'model.viewport.height': this.model.viewport.height,
				'minDst': this.minDst,
				'maxDst': this.maxDst,
				});
				*/

		var async = true;

		this.getObjects(
				new Array( "IIP", "IIP-server", "Tile-size" ),
				function(vals)
				{
					if (this.wlz)
					{
						/*
						 * Need to get bounding box first so that we can
						 * set our fixed point
						 */
						this.getObjects( new Array( "Wlz-3d-bounding-box" ),
							function(vals)
							{
								this.fxp.x = Math.round(this.fullWlzObject.x.min + (this.fullWlzObject.x.max - this.fullWlzObject.x.min) / 2);
								this.fxp.y = Math.round(this.fullWlzObject.y.min + (this.fullWlzObject.y.max - this.fullWlzObject.y.min) / 2);
								this.fxp.z = Math.round(this.fullWlzObject.z.min + (this.fullWlzObject.z.max - this.fullWlzObject.z.min) / 2);

								this.getObjects( new Array( "Max-size", "Wlz-distance-range" ),
									function(vals)
									{
										this.waiters--;
										this.notify([typeEnum.loading]);
										this.notify([typeEnum.all]);
										this.notify([typeEnum.sclextents]);
									}.bind(this),
									async
								);
							}.bind(this),
							async
						);
					}
					else
					{
						this.getObjects( new Array( "Max-size", "Resolution-number" ),
							function(vals) {
								this.waiters--;
								this.notify([typeEnum.loading]);
								this.notify([typeEnum.all]);
								this.notify([typeEnum.sclextents]);
							}.bind(this),
							async
						);
					}
				}.bind(this),
				async
		);
	},


									/*
	setMinScl: function()
	{
		// Requires Max-size object
		if (!$defined(this.fullImage.width)
				|| !$defined(this.fullImage.height)
				|| !$defined(this.viewport.width)
				|| !$defined(this.viewport.height)
			 )
			return;

		var xmin = this.viewport.width / this.fullImage.width;
		var ymin = this.viewport.height / this.fullImage.height;
		this.minScl = (xmin < ymin) ? xmin : ymin;

		if (!this.wlz && this.minScl > 1)
			this.minScl = 1;
	},
	*/

	setMaxScl: function()
	{
		// Requires this.minScl
		if (this.wlz)
			this.maxScl = this.minScl * 8;
		else
			this.maxScl = 1;
	},

	fixMinScl: function()
	{
		// Requires Resolution-number, minscl
		if (!$defined(this.minScl))
			document.write("Error...");

		if (!this.wlz)
			this.minScl = this.res2scl(this.scl2res(this.minScl,true));
	},

	/*
	fixScl: function()
	{
		if ($defined(this.minScl) && this.scl < this.minScl)
			this.setScl(this.minScl);
		if ($defined(this.maxScl) && this.scl > this.maxScl)
			this.setScl(this.maxScl);
		if (!this.wlz)
			this.setScl(this.res2scl(this.scl2res(this.scl,false)));
	},
	*/


	fixROI: function() {

		if (this.xfit)
			this.roi.x = 0.5;
		else if (this.roi2vpl2() < 0)
			this.roi.x = this.vpl2roi(0);
		else if (this.roi2vpl2() + this.viewport.width > this.image.width)
			this.roi.x = this.vpl2roi(this.image.width - this.viewport.width);
		if (this.yfit)
			this.roi.y = 0.5;
		else if (this.roi2vpt2() < 0)
			this.roi.y = this.vpt2roi(0);
		else if (this.roi2vpt2() + this.viewport.height > this.image.height)
			this.roi.y = this.vpt2roi(this.image.height - this.viewport.height);
	},


	handleVariableChange: function(types, quiet, trigger) {

		var requiredObjects;
		var notifications = new Array();

		for (var i = 0; i < types.length; i++)
		{
			switch(types[i])
			{
				case 'dst':
					if (!this.wlz)
						this.fif = this.getfif();

					if ($chk(quiet)){
						notifications.push(typeEnum.dstquiet);
						notifications.push(typeEnum.context); //maze update contextmenu
					}
					else
					{
						if (this.wlz)
							requiredObjects = new Array( "Max-size" );
						else
							requiredObjects = new Array( "Max-size", "Resolution-number" );
						notifications.push(typeEnum.dst);
						notifications.push(typeEnum.sclextents);
						notifications.push(typeEnum.context); //maze update contextmenu
					}
					break;
				case 'scl':
					this.handleSclChange();
					notifications.push(typeEnum.scl);
					break;
				case 'ovl':
					notifications.push(typeEnum.ovl);
					break;
				case 'pit':
					if ($chk(quiet))
					{
						notifications.push(typeEnum.pitquiet);
						//notifications.push(typeEnum.dstquiet);
					}
					else
					{
						requiredObjects = new Array( "Max-size", "Wlz-distance-range" );
						notifications.push(typeEnum.pit);
						notifications.push(typeEnum.dst);
						notifications.push(typeEnum.sclextents);
					}
					break;
				case 'yaw':
					if ($chk(quiet))
					{
						notifications.push(typeEnum.yawquiet);
						//notifications.push(typeEnum.dstquiet);
					}
					else
					{
						requiredObjects = new Array( "Max-size", "Wlz-distance-range" );
						notifications.push(typeEnum.yaw);
						notifications.push(typeEnum.dst);
						notifications.push(typeEnum.sclextents);
					}
					break;
				case 'x':
				case 'y':
					notifications.push(typeEnum.scroll);
					break;
				default:
					alert("Unknown variable");
			}
		}

		if ($defined(requiredObjects))
		{
			this.getObjects(
					requiredObjects,
				function() {
					this.notify(notifications, trigger);
				}.bind(this),
				false
			);
		}
		else
			this.notify(notifications, trigger);
	},


	/**
	 * Putting all of the variable-modifying code in one function
	 * allows us to merge notifications.  There might be a better
	 * way, but this works.
	 */
	setVals: function(types, values, quiet, trigger) {

		if (!$defined(trigger))
			alert("No trigger defined" + types + ", " + values);

		var modifiedVariables = new Array();

		for (var i = 0; i < types.length; i++)
		{
			switch(types[i])
			{
				case 'dst':
					var dst = values[i];
					if (dst < this.dst.min) dst = this.dst.min;
					else if (dst > this.dst.max) dst = this.dst.max;
					this.dst.cur = Math.round(dst);
					modifiedVariables.push('dst');
					break;
				case 'scl':
					var scl = values[i];
					if (scl < this.scl.min) scl = this.scl.min;
					else if (scl > this.scl.max) scl = this.scl.max;
					// Round to a power of 2
					scl = Math.pow(2,Math.round(Math.log(scl) / Math.log(2)));
					if (scl == this.scl.cur)
						break;
					this.scl.cur = scl;
					modifiedVariables.push('scl');
					break;
				case 'ovl':
					var ovl = values[i];
					if (ovl < this.ovl.min) ovl = this.ovl.min;
					else if (ovl > this.ovl.max) ovl = this.ovl.max;
					this.ovl.cur = Math.round(ovl*10) / 10;
					modifiedVariables.push('ovl');
					break;
				case 'pit':
					this.pit.cur = values[i];
					modifiedVariables.push('pit');
					break;
				case 'yaw':
					this.yaw.cur = values[i];
					modifiedVariables.push('yaw');
					break;
				case 'x':
					this.roi.x = values[i];
					modifiedVariables.push('x');
					break;
				case 'y':
					this.roi.y = values[i];
					modifiedVariables.push('y');
					break;
				default:
					alert("Unknown variable");
			}
		}
		this.handleVariableChange(modifiedVariables, quiet, trigger);
	},


	setWinMinScl: function()
	{
		var xmin = this.viewport.width / this.fullImage.width;
		var ymin = this.viewport.height / this.fullImage.height;
		var min = (xmin < ymin) ? xmin : ymin;

		// Get minimum scale (as a power of 2) that will allow image to fit within window
		if (this.wlz)
		{
			this.scl.winmin = Math.pow(2,Math.floor(Math.log(min) / Math.log(2)));
			this.scl.initial = this.scl.winmin;
		}
		else
		{
			this.scl.winmin = 0;
			this.scl.initial = Math.pow(2,Math.floor(Math.log(min) / Math.log(2)));
		}

		this.setMinScl();
	},
	

	setIIPMinScl: function()
	{
		this.scl.iipmin = Math.pow(2,-this.maxiipres);
		this.setMinScl();
	},


	fixScl: function()
	{
		if (!$defined(this.scl.cur))
			this.scl.cur = this.scl.initial;
		if (this.scl.cur < this.scl.min)
			this.scl.cur = this.scl.min;
		this.handleSclChange();
	},


	setMinScl: function()
	{
		this.scl.min = (this.scl.iipmin > this.scl.winmin) ? this.scl.iipmin : this.scl.winmin;
		this.scl.min = (this.scl.min < 1) ? this.scl.min : 1;
		this.fixScl();
	},


	handleSclChange: function()
	{
		this.image.width = this.fullImage.width * this.scl.cur;
		this.image.height = this.fullImage.height * this.scl.cur;
		this.viewable.width = (this.viewport.width < this.image.width) ? this.viewport.width : this.image.width;
		this.viewable.height = (this.viewport.height < this.image.height) ? this.viewport.height : this.image.height;
		this.xfit = (this.viewport.width > this.image.width)
		this.yfit = (this.viewport.height > this.image.height)
		this.fixROI();
	},

	setViewportSize: function(width,height) {

		var notifications = new Array();
		notifications.push(typeEnum.viewport);
		this.viewport.width = width;
		this.viewport.height = height;
		if ($defined(this.image.width) && $defined(this.image.height))
		{
			this.setWinMinScl();
			/*
			if (!$defined(this.scl.cur)) this.scl.cur = this.scl.initial;
			if (this.scl.cur < this.scl.min)
			{
				this.scl.cur = this.scl.min;
				notifications.push(typeEnum.scl);
			}
			this.handleSclChange();
			*/
			notifications.push(typeEnum.sclextents);
		}
		this.notify(notifications);
	},


	/**
	 * Converts a Woolz scale value to an IIP JTL resolution level
	 *
	 * @author Tom Perry
	 *
	 * @param floor If true, the integer part of the resulting
	 * resolution value will be returned.  Otherwise, it will be
	 * rounded to the nearest integer.
	 */
	scl2res: function(scl, floor) {

		var tmp = this.maxiipres + Math.log(scl) / Math.log(2);
		if ($chk(floor))
			return Math.floor(tmp);
		else
			return Math.round(tmp);
	},


	/**
	 * Converts an IIP JTL resolution level to a Woolz scale value
	 *
	 * @author Tom Perry
	 */
	res2scl: function(res) {
		return Math.pow(2,res - this.maxiipres);
	},


	/**
	 * Nasty set of functions that convert between
	 * region-of-interest (i.e.  a value between 0 and 1 expressing
	 * the position of the centre of the viewport) and the position
	 * of the top/left edge of the viewport with respect to the
	 * currently displayed image.
	 */
	roi2vpl: function() {

		if (this.image.width > this.viewport.width)
			return this.roi.x * this.image.width - this.viewport.width/2
		else
			return 0;
	},


	roi2vpt: function() {

		if (this.image.height > this.viewport.height)
			return this.roi.y * this.image.height - this.viewport.height/2
		else
			return 0;
	},


	roi2vpl2: function() {

		return this.roi.x * this.image.width - this.viewport.width/2
	},


	roi2vpt2: function() {

		return this.roi.y * this.image.height - this.viewport.height/2
	},


	vpl2roi: function(vp) {

		return (vp + this.viewport.width/2) / this.image.width;
	},


	vpt2roi: function(vp) {

		return (vp + this.viewport.height/2) / this.image.height;
	}

});



var LoadingFrame = new Class({

	initialize: function(source,model) {

		this.source = source;
		this.model = model;
		model.attach(this,[typeEnum.loading]);

		this.loading = new Element('div', {
			'id': 'loading-win',
			'styles': {
				'left': (window.getWidth()/2) - 64 + 'px',
				'top':	(window.getHeight()/2) - 32 + 'px'
			}
		});

		new Element('img', {
			'id': 'loading-image',
			'src': 'images/loading.gif'
		}).injectInside(this.loading);

		this.message = new Element('div', {
			'id': 'loading-message',
			'styles': {
				'font-size': '9pt'
			}
		});

		this.message.innerHTML = "Loading image data...";
		this.message.injectInside(this.loading);

		this.loading.injectInside(this.source);
		this.loading.style.display = 'none';
		this.isLoading = false;

	},

	update: function(types) {

		if (this.model.waiters > 0)
			this.displayLoadingImage();
		else if (this.model.waiters == 0)
			this.hideLoadingImage();
		else
			alert("Invalid state");
	},

	displayLoadingImage: function() {

		if (!this.isLoading)
		{
			this.isLoading = true;
			this.timeout = setTimeout(function() {
				this.loading.style.display = 'block';
			}.bind(this), 500);
		}
	},

	hideLoadingImage: function() {

		this.isLoading = false;
		clearTimeout(this.timeout);
		this.loading.style.display = 'none';

		/*
		loading.effect('opacity', {
			duration: 750,
			frames: 10,
			transition: Fx.Transitions.quadOut,
			onComplete: function(){ loading.style.zIndex = '-1'; }
		}).start(1,0);
		*/
	}

});


var OverlayTileFrame = new Class({

	initialize: function(source,model,overlayfif,name,isovl,ispng) {
		this.source = source;
		this.model = model;
		this.types = [
			typeEnum.viewport,
			typeEnum.scroll,
			typeEnum.scl,
			typeEnum.dst,
			typeEnum.pit,
			typeEnum.yaw,
			typeEnum.rol,
			typeEnum.ovl 
			];
		model.attach(this,this.types);
		this.overlayfif = overlayfif;
		this.name = name;
		this.isOverlay = isovl;
		this.isPng = ispng;
		this.opacity = '1.0'; //for overlay and not annotation layer

		/*
		 * An alternative solution to Ruven Pillay's constrained
		 * dragging problem.  Instead of subclassing the MooTools
		 * Drag.Move class, we just create a large div that
		 * constrains the movement of the tile frame.
		 */
		this.overlayFrameContainer = new Element( 'div', {
			'id': this.name + '-container',
			'class': 'overlaycontainer'
		});
		this.overlayFrameContainer.injectInside( this.source );

		this.overlayFrame = new Element( 'div', {
			'id': this.name + '-frame',
			'class': 'overlayframe'
		});
		this.overlayFrame.addEvent('dblclick', function(e){ //maze
			var event = new Event(e);
			var newscl;

			if(event.shift) // for double clicks
				newscl = this.model.scl.cur / 2;
			else
				newscl = this.model.scl.cur * 2;

			this.model.setVals(['scl'],[newscl],false,'mouse');
		}.bind(this));


		this.overlayFrame.injectInside( this.overlayFrameContainer );
		this.overlayFrame.makeDraggable(getDragOpts( this.overlayFrameContainer.id, 0, this ));
		this.overlay = new Overlay(this,this.model);

	},


	handleDrag: function(done) {

		var x = 0.5;
		var y = 0.5;

		if (!this.model.xfit)
			x = 1 - (this.model.viewport.width/2 + this.overlayFrame.offsetLeft) / this.model.image.width;
		if (!this.model.yfit)
			y = 1 - (this.model.viewport.height/2 + this.overlayFrame.offsetTop) / this.model.image.height;

		this.model.setVals(['x','y'], [x,y], !done, this.overlayFrame.id); 
	},

	update: function(types, trigger) {

		$(this.source).style.width  = this.model.viewport.width + "px";
		$(this.source).style.height = this.model.viewport.height + "px";

		if (types.indexOf(typeEnum.scroll) != -1)
		{
			this.getDraggedTiles();
			if (trigger != this.overlayFrame.id)
				this.setTileFramePosition();
		}
		else
		{
			this.clearTiles();

			/*
			 * Introducing a delay allows the tileframe to be
			 * repositioned while no tiles are showing, which looks a
			 * lot more neat.
			 */
			setTimeout(function() {this.requestImages();}.bind(this), 10);

			if ($defined(this.model.image.width)
					&& $defined(this.model.image.height)
				)
			{
				if (this.model.xfit)
					this.overlayFrameContainer.style.width = this.model.image.width + 'px';
				else
					this.overlayFrameContainer.style.width = this.model.image.width*2-this.model.viewport.width + 'px';
				if (this.model.yfit)
					this.overlayFrameContainer.style.height = this.model.image.height + 'px';
				else
					this.overlayFrameContainer.style.height = this.model.image.height*2-this.model.viewport.height + 'px';

				this.overlayFrame.style.width = this.model.image.width + "px";
				this.overlayFrame.style.height = this.model.image.height + "px";

				this.setTileFramePosition();

				if ( this.isOverlay ){ //opacity updated from model object
					this.overlayFrameContainer.setStyle('opacity', this.model.ovl.cur);//this.opacity.cur);
					this.overlayFrame.setStyle('opacity', this.model.ovl.cur);
				} 
				else {
					this.overlayFrameContainer.setStyle('opacity', this.opacity);
					this.overlayFrame.setStyle('opacity', this.opacity);
				}
				//alert('overlayFrameContainer has opacity ' + this.overlayFrameContainer.getStyle('opacity') + 
				//	' and filter ' + this.overlayFrameContainer.getStyle('filter') );
			}
		}
	},


	setTileFramePosition: function() {

		if (this.model.xfit)
		{
			this.overlayFrameContainer.style.left = (this.model.viewport.width-this.model.image.width)/2 + 'px';
			this.overlayFrame.style.left = 0 + "px";
		}
		else
		{
			this.overlayFrameContainer.style.left = this.model.viewport.width-this.model.image.width + 'px';
			this.overlayFrame.style.left = -this.model.roi2vpl()
				+ this.model.image.width - this.model.viewport.width + "px";
		}
		if (this.model.yfit)
		{
			this.overlayFrameContainer.style.top = (this.model.viewport.height-this.model.image.height)/2 + 'px';
			this.overlayFrame.style.top = 0 + "px";
		}
		else
		{
			this.overlayFrameContainer.style.top = this.model.viewport.height-this.model.image.height + 'px';
			this.overlayFrame.style.top = -this.model.roi2vpt()
				+ this.model.image.height - this.model.viewport.height + "px";
		}

	},


	/**
	 * Gets the initial images for the view.
	 *
	 * @author Ruven Pillay, Tom Perry
	 */
	requestImages: function() {

		if (!(this.model.scl.cur >= this.model.scl.min && this.model.scl.cur <= this.model.scl.max))
		{
			alert("Error: cannot request image with scale "+this.model.scl.cur+"\n"
					+"Minimum scale: "+this.model.scl.min+", Maximum scale: "+this.model.scl.max);
			return;
		}

		// Loads tiles around the border
		var hiddenBorder = 1;

		this.res = Math.round(this.model.maxiipres + Math.log(this.model.scl.cur) / Math.log(2));

		this.startx = Math.floor( this.model.roi2vpl()
				/ this.model.tileSize.width ) - hiddenBorder ;
		this.starty = Math.floor( this.model.roi2vpt()
				/ this.model.tileSize.height ) - hiddenBorder ;
		this.endx = Math.floor( (this.model.roi2vpl() + this.model.viewable.width)
				/ this.model.tileSize.width ) + hiddenBorder ;
		this.endy = Math.floor( (this.model.roi2vpt() + this.model.viewable.height)
				/ this.model.tileSize.height ) + hiddenBorder ;

		var refresh = false;

		/*
		// Clear our tile refresher
		if( this.refresher )
		{
			$clear(this.refresher);
			this.refresher = null;
		}

		// Set our cursor and activate our loading animation
		if (refresh)
			$('tileframe').style.cursor = 'wait';
		else
			$('tileframe').style.cursor = 'move';
			*/

		this.xtiles = Math.ceil( this.model.image.width / this.model.tileSize.width );
		this.ytiles = Math.ceil( this.model.image.height / this.model.tileSize.height );

		// Create our image tile mosaic
		this.getTiles(this.startx,this.endx,this.starty,this.endy);

		// Create a tile refresher to check for unloaded tiles
		//if (refresh)
			//this.refresher = this.refresh.periodical( 500, this );

		// Get image maps for overlays
		if ($chk(this.model.hasOverlays))
			this.overlay.requestMaps();
	},


	/**
	 * Delete our old image mosaic
	 *
	 * @author Ruven Pillay
	 */
	clearTiles: function(scl,dst) {

		var tileClass = 's' + scl + 'd' + dst;

		this.overlayFrame.getChildren().each( function(el){
				if (!el.hasClass(tileClass))
					el.dispose();
				});
	},


	/*
	 * If we're requesting a Woolz image, we need to specify
	 * additional parameters
	 *
	 * @author Tom Perry
	 */
	getTileSrc: function(k)
	{
		var filetype = ( this.isPng ) ? "&ptl=" : "&jtl=" ;

		var src;
		if (this.model.wlz)
		{
			src = this.model.server + "?" + this.model.fif
				+ "&mod=" + this.model.mode
				+ "&fxp=" + this.model.fxp.x + ',' + this.model.fxp.y + ','+ this.model.fxp.z
				+ "&scl=" + this.model.scl.cur
				+ "&dst=" + this.model.dst.cur * this.model.scl.cur
				+ "&pit=" + this.model.pit.cur
				+ "&yaw=" + this.model.yaw.cur
				+ "&rol=" + this.model.rol.cur
				+ "&qlt=" + this.model.qlt.cur
				+ filetype + "0," + k;
		}
		else
		{
			//alert('src for overlay = ' + this.overlayfif + ', src for model = ' + this.model.fif);
			src = this.model.server+"?"+this.overlayfif
				+"&qlt=" + this.model.qlt.cur
				+ filetype + this.res+","+k;
		}
		return src;
	},


	/**
	 * Creates an <img> element, sets its src according to the
	 * arguments given, sets its absolute position, and other
	 * useful stuff.  See requestImages() for a function that
	 * creates all starting tiles appropriately
	 *
	 * @author Tom Perry
	 */
	getTile: function(i,j) {

		if (i < 0 || i >= this.xtiles || j < 0 || j >= this.ytiles)
			return;

		var k = i + (j*this.xtiles);

		var src = this.getTileSrc(k);

		var tileId = 'x' + i + 'y' + j;
		var tileClass = 's' + this.model.scl.cur
		              + 'd' + this.model.dst.cur;
    
		new Element('img', {
			'id': 'overlay-' + tileId,
			'src': src,
			'class': 'tile' + ' ' + tileClass,
			'useMap': '#components_'+tileId,
			'styles': {
				'left': i*this.model.tileSize.width,
				'top':  j*this.model.tileSize.height
				/*
				 * IE (7) tries to handle drags on <img> elements in an
				 * annoying way, which can be solved by setting the
				 * background image of a div element instead, but this
				 * prevents image map overlays.
				 */
				//'width': this.model.tileSize.width,
				//'height': this.model.tileSize.height,
				//'background-image': "url("+src+")"
			}
		}).injectInside(this.overlayFrame);

	},


	/**
	 * Deletes an <img> element.  See clearTiles() for a tile frame clearing
	 * function.
	 *
	 * @author Tom Perry
	 */
	removeTile: function(i, j) {

		var tileId = 'x' + i + 'y' + j;
		var tile = document.getElementById(tileId);
		if (tile)
			tile.dispose();
	},



	getTiles: function(sx,ex,sy,ey) {

		for (var j=0; j<=ey-sy; j++)
			for (var i=0; i<=ex-sx; i++)
				this.getTile(i+sx,j+sy);
	},



	removeTiles: function(sx,ex,sy,ey) {

		for (var j=0; j<=ey-sy; j++)
			for (var i=0; i<=ex-sx; i++)
				this.removeTile(i+sx,+sy);
	},



	/* 
	 * Refresh function to avoid the problem of tiles not loading
	 * properly in Firefox/Mozilla
	 *
	 * @author Ruven Pillay
	 */
	refresh: function() {

		var unloaded = 0;

		$(this.overlayFrame.id).getChildren().each( function(el){
			// If our tile has not yet been loaded, give it a prod ;-)
			if( el.width == 0 || el.height == 0 ){
				el.src = el.src;
				unloaded = 1;
			}
		});

		/*
		 * If no tiles are missing, destroy our refresher timer, fade
		 * out our loading animation and and reset our cursor
		 */
		if( unloaded == 0 ){

			$clear( this.refresher );
			this.refresher = null;

			$(this.overlayFrame.id).style.cursor = 'move';
		}
	},


	/**
	 * Load new tiles, remove old ones
	 *
	 * @author Tom Perry
	 */
	getDraggedTiles: function()
	{
		if (!this.model.xfit)
		{
			while (this.model.roi2vpl() + this.model.viewport.width
					> (this.endx+1) * this.model.tileSize.width)
			{
				this.getTiles(this.endx+1, this.endx+1, this.starty, this.endy);
				this.removeTiles(this.startx, this.startx, this.starty, this.endy);
				this.startx++;
				this.endx++;
			}
			while (this.model.roi2vpl()
					< this.startx * this.model.tileSize.width)
			{
				this.getTiles(this.startx-1, this.startx-1, this.starty, this.endy);
				this.removeTiles(this.endx, this.endx, this.starty, this.endy);
				this.startx--;
				this.endx--;
			}
		}

		if (!this.model.yfit)
		{
			while (this.model.roi2vpt() + this.model.viewport.height
					> (this.endy+1) * this.model.tileSize.height)
			{
				this.getTiles(this.startx, this.endx, this.endy+1, this.endy+1);
				this.removeTiles(this.startx, this.endx, this.starty, this.starty);
				this.starty++;
				this.endy++;
			}
			while (this.model.roi2vpt()
					< this.starty * this.model.tileSize.height)
			{
				this.getTiles(this.startx, this.endx, this.starty-1, this.starty-1);
				this.removeTiles(this.startx, this.endx, this.endy, this.endy);
				this.starty--;
				this.endy--;
			}
		}

	}

});




var TileFrame = new Class({

	initialize: function(source,model) {

		this.source = source;
		this.model = model;
		this.types = [
			typeEnum.viewport,
			typeEnum.scroll,
			typeEnum.scl,
			typeEnum.dst,
			typeEnum.pit,
			typeEnum.yaw,
			typeEnum.rol
			];
		model.attach(this,this.types);

		/*
		 * An alternative solution to Ruven Pillay's constrained
		 * dragging problem.  Instead of subclassing the MooTools
		 * Drag.Move class, we just create a large div that
		 * constrains the movement of the tile frame.
		 */
		this.tileFrameContainer = new Element( 'div', {
			id: 'tileframecontainer'
		});
		this.tileFrameContainer.injectInside( this.source );

		this.tileFrame = new Element( 'div', {
			id: 'tileframe'
		});
		this.tileFrame.addEvent('dblclick', function(e){ //maze
			var event = new Event(e);
			var newscl;

			if(event.shift) // for double clicks
				newscl = this.model.scl.cur / 2;
			else
				newscl = this.model.scl.cur * 2;

			this.model.setVals(['scl'],[newscl],false,'mouse');
		}.bind(this));

		this.tileFrame.injectInside( this.tileFrameContainer );
		this.tileFrame.makeDraggable(getDragOpts('tileframecontainer',0,this));
		this.overlay = new Overlay(this,this.model);

	},


	handleDrag: function(done) {

		var x = 0.5;
		var y = 0.5;

		if (!this.model.xfit)
			x = 1 - (this.model.viewport.width/2 + this.tileFrame.offsetLeft) / this.model.image.width;
		if (!this.model.yfit)
			y = 1 - (this.model.viewport.height/2 + this.tileFrame.offsetTop) / this.model.image.height;

		this.model.setVals(['x','y'], [x,y], !done, 'tileframe');
	},


	update: function(types, trigger) {

		$(this.source).style.width  = this.model.viewport.width + "px";
		$(this.source).style.height = this.model.viewport.height + "px";

		if (types.indexOf(typeEnum.scroll) != -1)
		{
			this.getDraggedTiles();
			if (trigger != 'tileframe')
				this.setTileFramePosition();
		}
		else
		{
			this.clearTiles();

			/*
			 * Introducing a delay allows the tileframe to be
			 * repositioned while no tiles are showing, which looks a
			 * lot more neat.
			 */
			setTimeout(function() {this.requestImages();}.bind(this), 10);

			if ($defined(this.model.image.width)
					&& $defined(this.model.image.height)
				)
			{
				if (this.model.xfit)
					this.tileFrameContainer.style.width = this.model.image.width + 'px';
				else
					this.tileFrameContainer.style.width = this.model.image.width*2-this.model.viewport.width + 'px';
				if (this.model.yfit)
					this.tileFrameContainer.style.height = this.model.image.height + 'px';
				else
					this.tileFrameContainer.style.height = this.model.image.height*2-this.model.viewport.height + 'px';

				this.tileFrame.style.width = this.model.image.width + "px";
				this.tileFrame.style.height = this.model.image.height + "px";

				this.setTileFramePosition();
			}
		}
	},


	setTileFramePosition: function() {

		if (this.model.xfit)
		{
			this.tileFrameContainer.style.left = (this.model.viewport.width-this.model.image.width)/2 + 'px';
			this.tileFrame.style.left = 0 + "px";
		}
		else
		{
			this.tileFrameContainer.style.left = this.model.viewport.width-this.model.image.width + 'px';
			this.tileFrame.style.left = -this.model.roi2vpl()
				+ this.model.image.width - this.model.viewport.width + "px";
		}
		if (this.model.yfit)
		{
			this.tileFrameContainer.style.top = (this.model.viewport.height-this.model.image.height)/2 + 'px';
			this.tileFrame.style.top = 0 + "px";
		}
		else
		{
			this.tileFrameContainer.style.top = this.model.viewport.height-this.model.image.height + 'px';
			this.tileFrame.style.top = -this.model.roi2vpt()
				+ this.model.image.height - this.model.viewport.height + "px";
		}

	},


	/**
	 * Gets the initial images for the view.
	 *
	 * @author Ruven Pillay, Tom Perry
	 */
	requestImages: function() {

		if (!(this.model.scl.cur >= this.model.scl.min && this.model.scl.cur <= this.model.scl.max))
		{
			alert("Error: cannot request image with scale "+this.model.scl.cur+"\n"
					+"Minimum scale: "+this.model.scl.min+", Maximum scale: "+this.model.scl.max);
			return;
		}

		// Loads tiles around the border
		var hiddenBorder = 1;

		this.res = Math.round(this.model.maxiipres + Math.log(this.model.scl.cur) / Math.log(2));

		this.startx = Math.floor( this.model.roi2vpl()
				/ this.model.tileSize.width ) - hiddenBorder ;
		this.starty = Math.floor( this.model.roi2vpt()
				/ this.model.tileSize.height ) - hiddenBorder ;
		this.endx = Math.floor( (this.model.roi2vpl() + this.model.viewable.width)
				/ this.model.tileSize.width ) + hiddenBorder ;
		this.endy = Math.floor( (this.model.roi2vpt() + this.model.viewable.height)
				/ this.model.tileSize.height ) + hiddenBorder ;

		var refresh = false;

		/*
		// Clear our tile refresher
		if( this.refresher )
		{
			$clear(this.refresher);
			this.refresher = null;
		}

		// Set our cursor and activate our loading animation
		if (refresh)
			$('tileframe').style.cursor = 'wait';
		else
			$('tileframe').style.cursor = 'move';
			*/

		this.xtiles = Math.ceil( this.model.image.width / this.model.tileSize.width );
		this.ytiles = Math.ceil( this.model.image.height / this.model.tileSize.height );

		// Create our image tile mosaic
		this.getTiles(this.startx,this.endx,this.starty,this.endy);

		// Create a tile refresher to check for unloaded tiles
		//if (refresh)
			//this.refresher = this.refresh.periodical( 500, this );

		// Get image maps for overlays
		if ($chk(this.model.hasOverlays))
			this.overlay.requestMaps();
	},


	/**
	 * Delete our old image mosaic
	 *
	 * @author Ruven Pillay
	 */
	clearTiles: function(scl,dst) {

		var tileClass = 's' + scl + 'd' + dst;

		$('tileframe').getChildren().each( function(el){
				if (!el.hasClass(tileClass))
					el.dispose();
				});
	},


	/*
	 * If we're requesting a Woolz image, we need to specify
	 * additional parameters
	 *
	 * @author Tom Perry
	 */
	getTileSrc: function(k)
	{
		var src;
		if (this.model.wlz)
		{
			src = this.model.server + "?" + this.model.fif
				+ "&mod=" + this.model.mode
				+ "&fxp=" + this.model.fxp.x + ',' + this.model.fxp.y + ','+ this.model.fxp.z
				+ "&scl=" + this.model.scl.cur
				+ "&dst=" + this.model.dst.cur * this.model.scl.cur
				+ "&pit=" + this.model.pit.cur
				+ "&yaw=" + this.model.yaw.cur
				+ "&rol=" + this.model.rol.cur
				+ "&qlt=" + this.model.qlt.cur
				+ "&jtl=0," + k;
		}
		else
		{
			src = this.model.server+"?"+this.model.fif
				+"&qlt="+this.model.qlt.cur
				+"&jtl="+this.res+"," + k;
		}
		return src;
	},


	/**
	 * Creates an <img> element, sets its src according to the
	 * arguments given, sets its absolute position, and other
	 * useful stuff.  See requestImages() for a function that
	 * creates all starting tiles appropriately
	 *
	 * @author Tom Perry
	 */
	getTile: function(i,j) {

		if (i < 0 || i >= this.xtiles || j < 0 || j >= this.ytiles)
			return;

		var k = i + (j*this.xtiles);

		var src = this.getTileSrc(k);

		var tileId = 'x' + i + 'y' + j;
		var tileClass = 's' + this.model.scl.cur
		              + 'd' + this.model.dst.cur;
    
		new Element('img', {
			'id': tileId,
			'src': src,
			'class': 'tile' + ' ' + tileClass,
			'useMap': '#components_'+tileId,
			'styles': {
				'left': i*this.model.tileSize.width,
				'top':  j*this.model.tileSize.height
				/*
				 * IE (7) tries to handle drags on <img> elements in an
				 * annoying way, which can be solved by setting the
				 * background image of a div element instead, but this
				 * prevents image map overlays.
				 */
				//'width': this.model.tileSize.width,
				//'height': this.model.tileSize.height,
				//'background-image': "url("+src+")"
			}
		}).injectInside('tileframe');

	},


	/**
	 * Deletes an <img> element.  See clearTiles() for a tile frame clearing
	 * function.
	 *
	 * @author Tom Perry
	 */
	removeTile: function(i, j) {

		var tileId = 'x' + i + 'y' + j;
		var tile = document.getElementById(tileId);
		if (tile)
			tile.dispose();
	},



	getTiles: function(sx,ex,sy,ey) {

		for (var j=0; j<=ey-sy; j++)
			for (var i=0; i<=ex-sx; i++)
				this.getTile(i+sx,j+sy);
	},



	removeTiles: function(sx,ex,sy,ey) {

		for (var j=0; j<=ey-sy; j++)
			for (var i=0; i<=ex-sx; i++)
				this.removeTile(i+sx,+sy);
	},



	/* 
	 * Refresh function to avoid the problem of tiles not loading
	 * properly in Firefox/Mozilla
	 *
	 * @author Ruven Pillay
	 */
	refresh: function() {

		var unloaded = 0;

		$('tileframe').getChildren().each( function(el){
			// If our tile has not yet been loaded, give it a prod ;-)
			if( el.width == 0 || el.height == 0 ){
				el.src = el.src;
				unloaded = 1;
			}
		});

		/*
		 * If no tiles are missing, destroy our refresher timer, fade
		 * out our loading animation and and reset our cursor
		 */
		if( unloaded == 0 ){

			$clear( this.refresher );
			this.refresher = null;

			$('tileframe').style.cursor = 'move';
		}
	},


	/**
	 * Load new tiles, remove old ones
	 *
	 * @author Tom Perry
	 */
	getDraggedTiles: function()
	{
		if (!this.model.xfit)
		{
			while (this.model.roi2vpl() + this.model.viewport.width
					> (this.endx+1) * this.model.tileSize.width)
			{
				this.getTiles(this.endx+1, this.endx+1, this.starty, this.endy);
				this.removeTiles(this.startx, this.startx, this.starty, this.endy);
				this.startx++;
				this.endx++;
			}
			while (this.model.roi2vpl()
					< this.startx * this.model.tileSize.width)
			{
				this.getTiles(this.startx-1, this.startx-1, this.starty, this.endy);
				this.removeTiles(this.endx, this.endx, this.starty, this.endy);
				this.startx--;
				this.endx--;
			}
		}

		if (!this.model.yfit)
		{
			while (this.model.roi2vpt() + this.model.viewport.height
					> (this.endy+1) * this.model.tileSize.height)
			{
				this.getTiles(this.startx, this.endx, this.endy+1, this.endy+1);
				this.removeTiles(this.startx, this.endx, this.starty, this.starty);
				this.starty++;
				this.endy++;
			}
			while (this.model.roi2vpt()
					< this.starty * this.model.tileSize.height)
			{
				this.getTiles(this.startx, this.endx, this.starty-1, this.starty-1);
				this.removeTiles(this.startx, this.endx, this.endy, this.endy);
				this.starty--;
				this.endy--;
			}
		}

	}

});



/**
 * Modified from the one written by Tom Perry.
 */
var DraggableWindow = new Class({
	initialize: function(source, title, model)
	{
		this.title = title.toLowerCase().split(" ").join("");
		this.prevEventOver = true;
		this.model = model;
		model.attach(this,[
			typeEnum.viewport
			]);
		this.container = new Element( 'div', {
			'id': this.title + '-container',
			'class': 'draggable-container'
		});
		this.container.injectInside(source);
		this.container.style.display = 'none';
		this.handle = new Element( 'div', {
			'id': this.title + '-handle',
			'class': 'draggable-handle',
		});
		this.handle.injectInside( this.container );
		this.container.makeDraggable(getDragOpts(null,0,this,this.title+'-handle'));
		this.win = new Element( 'div', {
			'id': this.title + '-win',
			'class': 'draggable-win'
		});
		this.win.injectInside( this.container );
	},

	handleDrag: function(done)
	{
		var x = (this.container.offsetLeft + this.width / 2 < this.model.viewport.width / 2)
		? this.container.offsetLeft : this.container.offsetLeft - this.model.viewport.width + this.width;
		var y = (this.container.offsetTop + this.height / 2 < this.model.viewport.height / 2)
		? this.container.offsetTop : this.container.offsetTop - this.model.viewport.height + this.height;
		this.setPosition(x,y);
	},

	update: function(types) {
		this.applyPosition();
	},

	setVisible: function(visible) {
		if (visible)
			this.container.style.display = 'block';
		else
			this.container.style.display = 'none';
	},

	setPosition: function(x,y) {
		this.x = x;
		this.y = y;
	},

	applyPosition: function() {
		if (this.x >= 0)
			this.container.style.left = this.x + 'px';
		else if (this.x < 0)
			this.container.style.left = this.model.viewport.width - this.width + this.x + 'px';
		if (this.y >= 0)
			this.container.style.top = this.y + 'px';
		else if (this.y < 0)
			this.container.style.top = this.model.viewport.height - this.height + this.y + 'px';
	},

	setDimensions: function(wid,hei) {
		this.width = Number(wid);
		this.height = Number(hei);
		this.container.style.width = Math.round(this.width) + 'px';
		this.container.style.height = Math.round(this.height) + 'px';
		this.handle.style.width = Math.round(this.width) + 'px';
		this.handle.style.height = Math.round(this.height) + 'px';
		this.win.style.width = Math.round(this.width) + 'px';
		this.win.style.height = Math.round(this.height) + 'px';
	}
});


var VarWin = new Class({

	initialize: function(source,model) {

		this.model = model;
		model.attach(this,[
			typeEnum.viewport,
			typeEnum.scroll,
			typeEnum.scl,
			typeEnum.dst,
			typeEnum.dstquiet,
			typeEnum.pit,
			//typeEnum.pitquiet,
			typeEnum.yaw,
			//typeEnum.yawquiet,
			typeEnum.rol
			]);

		this.window = new DraggableWindow(source,'varwin',model);
		this.window.setDimensions(200,200);

	},

	update: function(types)
	{
		this.window.setVisible(true);
		var foo = 100;
		this.window.win.innerHTML = "<table width='200px'>" + 
			"<tr><td>    </td><td>cur</td><td>min</td><td>max</td></tr>" + 
			"<tr><td>scl:</td><td>" + Math.round(this.model.scl.cur * foo)/foo + "</td><td>" + Math.round(this.model.scl.min * foo)/foo + "</td><td>" + Math.round(this.model.scl.max * foo)/foo + "</td></tr>" +
			"<tr><td>dst:</td><td>" + Math.round(this.model.dst.cur * foo)/foo + "</td><td>" + Math.round(this.model.dst.min * foo)/foo + "</td><td>" + Math.round(this.model.dst.max * foo)/foo + "</td></tr>" +
			"<tr><td>pit:</td><td>" + Math.round(this.model.pit.cur * foo)/foo + "</td><td>" + Math.round(this.model.pit.min * foo)/foo + "</td><td>" + Math.round(this.model.pit.max * foo)/foo + "</td></tr>" +
			"<tr><td>yaw:</td><td>" + Math.round(this.model.yaw.cur * foo)/foo + "</td><td>" + Math.round(this.model.yaw.min * foo)/foo + "</td><td>" + Math.round(this.model.yaw.max * foo)/foo + "</td></tr>" +
			"<tr><td>rol:</td><td>" + Math.round(this.model.rol.cur * foo)/foo + "</td><td>" + Math.round(this.model.rol.min * foo)/foo + "</td><td>" + Math.round(this.model.rol.max * foo)/foo + "</td></tr>" +
			"</table>" + 
			"<p>fxp: " + Math.round(this.model.fxp.x * foo)/foo + "," + Math.round(this.model.fxp.y * foo)/foo + "," + Math.round(this.model.fxp.z * foo)/foo + "</p>"
	}

});


/*
 * Modified from the HGU code.
 */
var Locator = new Class({
	initialize: function(source, server, model) {
			// The <div> with id 'roiControl' is created by ngembryo.
			this.maxWidth = dojo.style("roiControl", "width");
this.maxHeight = dojo.style("roiControl", "height");
		this.server = server;
		this.model = model;
		model.attach(this,[
			typeEnum.viewport,
			typeEnum.scroll,
			typeEnum.scl,
			typeEnum.dst,
			typeEnum.dstquiet,
			typeEnum.pit,
			typeEnum.pitquiet,
			typeEnum.yaw,
			typeEnum.yawquiet,
			typeEnum.rol
			]);
		this.zoneBorder = 1;
		var title = "Locator";
		this.title = title.toLowerCase().split(" ").join("");
		this.imageContainer = new Element( 'div', {
			'id': this.title+'-imagecontainer',
			'class': 'imagecontainer'
		});
		this.imageContainer.injectInside( source );
		this.image = new Element( 'img', {
			id: this.title+'-image'
		});
		this.image.injectInside( this.imageContainer );

		this.zone = new Element( 'div', {
			'id': this.title+'-zone',
			'class': 'zone',
			'styles': {
				'border': this.zoneBorder + 'px solid yellow'
			}
		});
		this.zone.injectInside( this.imageContainer );
		this.zone.makeDraggable(getDragOpts(this.title+'-imagecontainer',0,this));
	},


	handleDrag: function(done) {
		var x = 0.5;
		var y = 0.5;
		if (!this.model.xfit)
			x = (this.zone.offsetLeft + this.zonewidth / 2) / this.navwidth;
		if (!this.model.yfit)
			y = (this.zone.offsetTop  + this.zoneheight / 2) / this.navheight;
		this.model.setVals(['x','y'], [x,y], !done, 'locator');
	},

	update: function(types, trigger) {
		if (types.indexOf(typeEnum.dst) != -1
				|| types.indexOf(typeEnum.dstquiet) != -1
				|| types.indexOf(typeEnum.pit) != -1
				|| types.indexOf(typeEnum.yaw) != -1
				|| types.indexOf(typeEnum.rol) != -1
				|| types.indexOf(typeEnum.all) != -1)
		{
			var w = this.model.fullImage.width;
			this.navscale = 1;
			while (w > 2 * this.minNavWidth) //maze note: loop is never entered - minNavWidth is undefined
			{
				w = Math.round(w/2);
				this.navscale /= 2;
			}
			var w = this.maxWidth / this.model.fullImage.width;
			var h = this.maxHeight / this.model.fullImage.height;
			this.navscale = (w < h) ? w : h;

			this.navwidth  = (this.navscale * this.model.fullImage.width);
			this.navheight = (this.navscale * this.model.fullImage.height);

			if (this.model.wlz)
			{
				var navsrc = this.server + '?' + this.model.fif
						+ "&mod=" + this.model.mode
						+ "&fxp=" + this.model.fxp.x + ',' + this.model.fxp.y + ','+ this.model.fxp.z
						+ "&scl=" + this.navscale
						+ "&dst=" + this.model.dst.cur * this.navscale
						+ "&pit=" + this.model.pit.cur
						+ "&yaw=" + this.model.yaw.cur
						+ "&rol=" + this.model.rol.cur
						+ "&qlt=" + this.model.qlt.cur
						+ '&cvt=jpeg';
						//+ "&jtl=0,0";
			}
			else
			{
				var navsrc = this.server + '?' + this.model.fif
						+ '&wid=' + this.navwidth * 2
						+ '&qlt=' + this.model.qlt.cur
						+ '&cvt=jpeg';

				this.image.style.width = this.navwidth + 'px';
				this.image.style.height = this.navheight + 'px';
				this.imageContainer.style.width = this.navwidth + 'px';
				this.imageContainer.style.height = this.navheight + 'px';
			}
			this.imageContainer.style.left = Math.round((this.maxWidth - this.navwidth)/2) + 'px';
			this.imageContainer.style.top = Math.round((this.maxHeight - this.navheight)/2) + 'px';

			this.image.src = navsrc;
		}
		if (types.indexOf(typeEnum.dst) != -1
				|| types.indexOf(typeEnum.dstquiet) != -1
				|| types.indexOf(typeEnum.scl) != -1
				|| types.indexOf(typeEnum.pit) != -1
				|| types.indexOf(typeEnum.yaw) != -1
				|| types.indexOf(typeEnum.rol) != -1
				|| types.indexOf(typeEnum.viewport) != -1
				|| types.indexOf(typeEnum.all) != -1)
		{
			this.zonewidth =  this.navscale * this.model.viewable.width  / this.model.scl.cur;
			this.zoneheight = this.navscale * this.model.viewable.height / this.model.scl.cur;

			if ($chk(this.zonewidth))
				this.zone.style.width = this.zonewidth - 2 * this.zoneBorder + 'px';
			if ($chk(this.zoneheight))
				this.zone.style.height = this.zoneheight - 2 * this.zoneBorder + 'px';
		}
		if (types.indexOf(typeEnum.dst) != -1
				|| types.indexOf(typeEnum.dstquiet) != -1
				|| types.indexOf(typeEnum.scl) != -1
				|| types.indexOf(typeEnum.pit) != -1
				|| types.indexOf(typeEnum.yaw) != -1
				|| types.indexOf(typeEnum.rol) != -1
				|| types.indexOf(typeEnum.scroll) != -1
				|| types.indexOf(typeEnum.viewport) != -1
				|| types.indexOf(typeEnum.all) != -1)
		{
			if (trigger != 'locator')
			{
				var x = this.model.roi.x * this.navwidth - this.zonewidth/2;
				var y = this.model.roi.y * this.navheight - this.zoneheight/2;
				if ($chk(x))
					this.zone.style.left = x + 'px';
				if ($chk(y))
					this.zone.style.top = y + 'px';
			}
		}
	}

});


var SectionPlane = new Class({
	Implements: Options,

	initialize: function(source,server,model,options) {
			
		this.server = server;
		this.model = model;
		model.attach(this,[
			typeEnum.pit,
			typeEnum.pitquiet,
			typeEnum.yawquiet,
			typeEnum.yaw,
			]);

		this.setOptions(options);

		this.width = dojo.style(source, "width");
		this.height = dojo.style(source, "height");
		this.textheight = 32;
		this.shorttitle = this.options.title.toLowerCase().split(" ").join("");

		this.window = new DraggableWindow(source,this.options.title,model);
		this.window.setDimensions(this.width, this.height);
		this.window.win.style.background = this.options.bgcolor;

		this.image = new Element( 'img', {
			'id': this.shorttitle + '-image',
			'class': 'sectionplane-image',
			'styles': {
				'cursor': 'move',
				'left': '0px',
											  'top': '0px',
											  'width': this.width,
											  'height': this.height
			}
		});
		this.image.injectInside( this.window.win );
		//this.image.addEvent( 'dblclick', this.onKey.bindWithEvent(this) );

// 		this.feedback = new Element( 'div', {
// 			'id': this.shorttitle + '-feedback',
// 				'styles': {
// 					'position': 'absolute',
// 					'top': this.height - this.textheight + 'px',
// 					'left': '0px',
// 					'color': 'white',
// 					'font-size': '8pt'
// 				}
// 		});
// 		this.feedback.injectInside( this.window.win );

// 		this.pitchfb = new Element( 'p', {
// 				'styles': {
// 					'position': 'absolute',
// 					'width' : this.width / 2,
// 					'left': '0px'
// 				}
// 		});
// 		this.pitchfb.injectInside(this.feedback);

// 		this.yawfb = new Element( 'p', {
// 				'styles': {
// 					'position': 'absolute',
// 					'width' : this.width / 2,
// 					'left': this.width / 2 + 'px'
// 				}
// 		});
// 		this.yawfb.injectInside(this.feedback);

		new Drag(this.shorttitle + '-image', getDragOpts(null,10,this));

	},

	onKey: function(e) {
					 alert(e.target);
	},


	handleDrag: function(done) {

		var pit = parseInt(this.image.style.top);
		var yaw = -parseInt(this.image.style.left);
		pit = Math.round(pit / this.options.inc) * this.options.inc;
		pit = ((pit % this.model.pit.max) + this.model.pit.max) % this.model.pit.max;
		yaw = Math.round(yaw / this.options.inc) * this.options.inc;
		yaw = ((yaw % this.model.yaw.max) + this.model.yaw.max) % this.model.yaw.max;
		this.model.setVals(['pit','yaw'],[pit,yaw],!done,'sectionplane');
		$('pitchValue').set('html', this.model.pit.cur);
		ngembryo.pitchSlider.set(this.model.pit.cur);
		$('yawValue').set('html', this.model.yaw.cur);
		ngembryo.yawSlider.set(this.model.yaw.cur);
	},


	update: function(types, trigger)
	{
		if (!this.model.wlz)
			return;
		this.window.setVisible(true);

		var k = Math.round(this.model.pit.cur * this.options.numpit / this.model.pit.max) * this.options.numyaw
			+ Math.round(this.model.yaw.cur * this.options.numyaw / this.model.yaw.max);

		var src = this.server + "?fif=" + this.options.src + "&jtl=0,"+k;
		//this.image.style.backgroundImage = 'url('+src+')';
		this.image.src = src;
	}

});




var VarSlider = new Class({
	Implements: Options,
	
	initialize: function(source,model,variable,thing,types,quiet,loud,overlay,options,slideroptions) {

		//this.options = options;
		//this.slideroptions = slideroptions;
		this.setOptions(options);
		this.setOptions(slideroptions);
		this.source = source;
		this.model = model;
		this.variable = variable;
		this.shortName = this.options.name.toLowerCase().split(" ").join("");
		this.thing = thing;
		this.types = types;
		this.quiet = quiet;
		this.loud = loud;
		this.overlay = overlay;
		this.textheight = 20;
		var pos = 10;

		model.attach(this,types);

		this.window = new DraggableWindow(source,this.options.name,model);
		this.window.setPosition(options.pos[0],options.pos[1]);
		//this.window.win.style.background = "#929292";
		//this.window.win.style.opacity = "0.6";

		var buttonsize = 16;
		this.button_border = 1;
		this.padding = 3;

		this.up = new Element( 'div', {
			'id': this.shortName + '-up',
			'styles': {
				'position': 'absolute',
				'text-align': 'center',
				'left': (this.options.width - buttonsize) / 2 + 'px',
				'top': pos + 'px',
				'width' : buttonsize,
				'height' : buttonsize,
				'font-size': '8pt',
				'border': this.button_border + 'px solid gray',
				'cursor': 'pointer'
			}
		});
		this.up.innerHTML = "+";
		this.up.injectInside( this.window.win );
		pos += buttonsize + this.button_border * 2 + this.padding;

		this.up.addEvent('click',function() {
				this.thing.increment();
			}.bind(this));

		this.bgpos = pos;
		pos += this.options.height + this.options.thumbheight + this.padding;

		this.down = new Element( 'div', {
			'id': this.shortName + '-down',
			'styles': {
				'position': 'absolute',
				'text-align': 'center',
				'left': (this.options.width - buttonsize) / 2 + 'px',
				'top': pos + 'px',
				'width' : buttonsize,
				'height' : buttonsize,
				'font-size': '8pt',
				'border': this.button_border + 'px solid gray',
				'cursor': 'pointer'
			}
		});
		this.down.innerHTML = "-";
		this.down.injectInside( this.window.win );
		pos += buttonsize + 2*this.padding;

		this.down.addEvent('click',function() {
				this.thing.decrement();
			}.bind(this));

		this.feedback = new Element( 'div', {
			'id': this.shortName + '-feedback',
			'styles': {
				'position': 'absolute',
				'text-align': 'center',
				'left': '0px',
				'top': pos + 'px',
				'width': this.options.width,
				'height': this.textheight,
				'font-size': '8pt'
			}
		});
		this.feedback.injectInside( this.window.win );
		pos += this.textheight

		this.window.setDimensions(this.options.width,pos);

		this.tickSize = 1;
		//this.thumb = this.shortName + "-thumb";
		this.maxval = this.options.height;

	},


	setYUISlider: function() {

		/*
		 * Can't reset tick size via YUI API, so must nuke everything.
		 */
		if ($defined(this.yslider))
		{
			this.bg.dispose();
			this.thumb.dispose();
		}

		this.bg = new Element('div', {
			'id': this.shortName + '-bg',
			'styles': {
				'position': 'absolute',
				'top': this.bgpos + 'px',
				'left': (this.options.width - this.options.bgwidth)/2 + 'px',
				'width': this.options.bgwidth + 'px',
				'height': this.options.height+this.options.thumbheight + 'px',
				'cursor': 'pointer'
			}
		});
		this.bg.injectInside(this.window.win);
		this.background = new Element('div', {
			'id': this.shortName + '-background',
			'styles': {
				'position': 'absolute',
				'top': this.options.thumbheight / 2 + 'px',
				'left': '0px',
				'width': this.options.bgwidth + 'px',
				'height': this.options.height + 'px',
				'background': 'url('+this.options.bgimg+') 0px 0px repeat-y'
			}
		});
		this.background.injectInside(this.bg);
		this.thumb = new Element('div', {
			'id': this.shortName + '-thumb',
			'styles': {
				'position': 'absolute', //'absolute',
				'left': (this.options.bgwidth - this.options.thumbwidth)/2 + 'px',
				'width': this.options.thumbwidth + 'px',
				'height': this.options.thumbheight + 'px',
				'cursor': 'move',
				'background': 'url('+this.options.thumbimg+') 0px 0px no-repeat'
			}
		});
		this.thumb.injectInside(this.bg);

		this.yslider = YAHOO.widget.Slider.getVertSlider(this.shortName + '-bg',
					this.shortName + '-thumb', 0, this.options.height, Math.floor(this.tickSize));
		this.yslider.animate = false;

		if (this.quiet)
		{
			this.yslider.subscribe("slideStart", function() {
					this.dragging = false;
					this.updateDelay = 10;//milliseconds
				}.bind(this));
			this.yslider.subscribe("change", function() {
					if (!this.dragging)
					{
						this.model.setVals([this.variable],[ this.getThumbOffset(this.yslider.getValue()) ],true,this.options.name);
						this.dragging = true;
						setTimeout(function() {
							this.dragging = false;
						}.bind(this) ,this.updateDelay);
					}
				}.bind(this));
		}
		if (this.loud)
		{
			this.yslider.subscribe("slideEnd", function() {
				this.model.setVals([this.variable],[ this.getThumbOffset(this.yslider.getValue()) ],false,this.options.name);
			}.bind(this));
		}
		if (this.overlay)
		{
			this.yslider.subscribe("slideStart", function() {
					this.dragging = false;
					this.updateDelay = 10;//milliseconds
				}.bind(this));
			this.yslider.subscribe("change", function() {
					if (!this.dragging)
					{
						//alert( this.getThumbOffset( this.yslider.getValue() ) );
						this.model.setVals([this.variable],[ this.getThumbOffset(this.yslider.getValue()) ],true,this.options.name);
						this.dragging = true;
						setTimeout(function() {
							this.dragging = false;
						}.bind(this) ,this.updateDelay);
					}
				}.bind(this));
			
		}
	},


	setTicks: function() {

		switch (this.options.scale)
		{
			case 'log':
				this.tickSize = (this.maxval / (Math.log(this.thing.max / this.thing.min) / Math.log(2)) );
				break;
			case 'lin':
				this.tickSize = (this.maxval / (this.thing.max - this.thing.min) );
				break;
			case 'sca':
				var unit = $defined( this.thing.inc ) ? this.thing.inc : this.thing.max / 10;
				this.tickSize = this.thing.max / unit;
				break;
		}

		if (this.tickSize < 1)
			this.tickSize = 1;

	},


	update: function(types, trigger) {

		this.window.setVisible(true);
		if (this.variable == 'scl')
			this.feedback.innerHTML = this.thing.cur + 'x';
		else
			this.feedback.innerHTML = Math.round(this.thing.cur * 1000) / 1000;

		if (trigger == this.options.name)
			return;
		
		if (types.indexOf(typeEnum.all) != -1)
		{
			this.setTicks();
			this.setYUISlider();
		}

		if (types.indexOf(typeEnum.sclextents) != -1 && this.variable == 'scl')
		{
			var ts = this.tickSize;
			this.setTicks();
			if (this.tickSize != ts)
				this.setYUISlider();
		}

		if ($chk(this.yslider))
		{
			var pos;
			var base = this.thing.max / this.thing.min;

			switch (this.options.scale)
			{
				case 'log':
					pos = Math.log(this.thing.cur / this.thing.min) / Math.log(base);
					break;
				case 'lin':
					pos = (this.thing.cur - this.thing.min) / (this.thing.max - this.thing.min);
					break;
				case 'sca':
					pos = (this.thing.cur - this.thing.min) / (this.thing.max - this.thing.min);
					break;
			}

			if (this.options.invert)
				this.yslider.setValue((1 - pos) * this.maxval,true,false,true);
			else
				this.yslider.setValue(pos * this.maxval,true,false,true);
		}
	},


	getThumbOffset: function(pos) {

		if (this.options.invert)
			var val = 1 - pos / this.maxval;
		else
			var val = pos / this.maxval;

		var base = this.thing.max / this.thing.min;

		switch (this.options.scale)
		{
			case 'log':
				val = Math.pow(base,val) * this.thing.min;
				break;
			case 'lin':
				val = (this.thing.min + val * (this.thing.max - this.thing.min));
				break;
			case 'sca':
				val = (this.thing.min + val * (this.thing.max - this.thing.min));
				break;
		}

		return val;
	}

});



var Selector = new Class({
	
	initialize: function(source,server,name,model,maxwidth,maxheight) {

		this.server = server;
		this.name = name;
		this.shortName = name.toLowerCase().split(" ").join("");
		this.model = model;
		model.attach(this,[
			typeEnum.dst,
			typeEnum.dstquiet,
			typeEnum.sel
			]);
		this.maxWidth = maxwidth;
		this.maxHeight = maxheight;

		this.window = new DraggableWindow(source,this.name,model);
		this.sliceborder = 10;
		this.slicecolor = 'yellow';
		this.slicewidth = 1;

		this.image = new Element( 'img', {
			styles: {
				'position': 'absolute'
			}
		});
		this.image.injectInside( this.window.win );

		this.sliceContainer = new Element( 'div', {
			id: this.shortName + '-slicecontainer',
			styles: {
				'position': 'absolute'
			}
		});
		this.sliceContainer.injectInside( this.window.win );

		this.slice = new Element( 'div', {
			id: this.shortName + '-slice',
			styles: {
				'cursor': 'move'
			}
		});
		this.slice.injectInside( this.sliceContainer );
		this.slice.makeDraggable(getDragOpts(this.shortName + '-slicecontainer',100,this));

		this.sliceBar = new Element( 'div', {
			id: this.shortName + '-slicebar',
			styles: {
				'position': 'absolute',
				'opacity': 0.8,
				'background': this.slicecolor
			}
		});
		this.sliceBar.injectInside( this.slice );

		this.textheight = 30;
		this.feedback = new Element( 'div', {
			'id': this.shortName + '-feedback',
			'styles': {
				'position': 'absolute',
				'left': '0px',
				'height': this.textheight,
				'text-align': 'center',
				'font-size': '8pt'
			}
		});
		this.feedback.injectInside( this.window.win );

		//maze---------------------add +- buttons---------------
		var buttonsize = 16;
		var textsize = 80;

		this.feedbacktext = new Element( 'div', {
			'id': this.shortName + '-feedbacktext',
			'styles': {
				'position': 'absolute',
				'top': '6px',
				'height': this.textheight,
				'width': textsize,
				'text-align': 'center',
				'font-size': '8pt'
			}
		});
		this.feedbacktext.injectInside( this.feedback );

		this.minus = new Element( 'div', {
			'id': this.shortName + '-minus',
			'styles': {
				'position': 'absolute',
				'top': '5px',
				'text-align': 'center',
				'width' : buttonsize,
				'height' : buttonsize,
				'font-size': '8pt',
				'border': 1 + 'px solid gray',
				'cursor': 'pointer'
			}
		});
		this.minus.innerHTML = "-";
 		this.minus.injectInside( this.feedback );

		this.minus.addEvent('click',function() {
				this.model.dst.decrement();
			}.bind(this));
		
		this.plus = new Element( 'div', {
			'id': this.shortName + '-plus',
			'styles': {
				'position': 'absolute',
				'top': '5px',
				'text-align': 'center',
				'width' : buttonsize,
				'height' : buttonsize,
				'font-size': '8pt',
				'border': 1 + 'px solid gray',
				'cursor': 'pointer'
			}
		});
		this.plus.innerHTML = "+";
 		this.plus.injectInside( this.feedback );

		this.plus.addEvent('click',function() {
				this.model.dst.increment();
			}.bind(this));
		//------------------end maze
	},


	handleDrag: function(done) {

		this.model.setVals(['dst'],[
				this.getSliceOffset()
				* (this.model.dst.max - this.model.dst.min)
			],!done,'selector');
	},


	getSliceOffset: function()
	{
		if (this.model.zsel.orientation == 'vertical')
			return this.slice.offsetLeft / (this.dragwidth - 2 * this.sliceborder - this.slicewidth);
		else if (this.model.zsel.orientation == 'horizontal')
			return this.slice.offsetTop / (this.dragheight - 2 * this.sliceborder - this.slicewidth);
		else
			alert("Error: selector orientation is invalid or undefined");
	},


	setSliceOffset: function(val)
	{
		if (this.model.zsel.orientation == 'vertical')
			this.slice.style.left = val * (this.dragwidth - 2 * this.sliceborder - this.slicewidth) + 'px';
		else if (this.model.zsel.orientation == 'horizontal')
			this.slice.style.top = val * (this.dragheight - 2 * this.sliceborder - this.slicewidth) + 'px';
		else
			alert("Error: selector orientation is invalid or undefined");
	},


	update: function(types, trigger)
	{
		if (!$defined(this.model.selsrc))
			return;

		this.feedbacktext.innerHTML = "Section: "+ (this.model.dst.cur+1).toString();
		if (types.indexOf(typeEnum.dstquiet) != -1
				&& trigger == 'selector')
			return;

		this.image.src = this.model.selsrc;
		this.window.setVisible(true);

		var w = this.maxWidth / this.model.zsel.width;
		var h = this.maxHeight / this.model.zsel.height;
		this.navscale = (w < h) ? w : h;
		if (this.navscale > 1) this.navscale = 1;
		this.imagewidth = (this.navscale * this.model.zsel.width);
		this.imageheight = (this.navscale * this.model.zsel.height);

		var tl = 0;
		var br = 0;
		if ($defined(this.model.zsel.border_tl))
			tl = this.model.zsel.border_tl;
		if ($defined(this.model.zsel.border_tl))
			br = this.model.zsel.border_br;

		this.dragwidth = this.imagewidth;
		this.dragheight = this.imageheight;

		// ----maze------- Offsets of drag constraint div relative to image
		var top = 0;
		var left = 0;
		var minwidth = 130;
		var leftoffset = (this.imagewidth < minwidth) ? (minwidth - this.imagewidth) / 2 : 0; //offset to place image in center of container if image is smaller than min window size

		if (this.model.zsel.orientation == 'horizontal')
		{
			this.dragheight = this.dragheight - tl - br + 2 * this.sliceborder + this.slicewidth;
			top = tl - this.sliceborder - this.slicewidth / 2;
			this.slice.style.width = this.imagewidth + 'px';
			this.slice.style.height = this.sliceborder * 2 + this.slicewidth + 'px';
			this.sliceBar.style.left = '0px';
			this.sliceBar.style.top = this.sliceborder + 'px';
			this.sliceBar.style.width = this.imagewidth + 'px';
			this.sliceBar.style.height = this.slicewidth + 'px';
		}
		else if (this.model.zsel.orientation == 'vertical')
		{
			this.dragwidth = this.dragwidth - tl - br + 2 * this.sliceborder + this.slicewidth;
			left = tl - this.sliceborder - this.slicewidth / 2;
			this.slice.style.width = this.sliceborder * 2 + this.slicewidth + 'px';
			this.slice.style.height = this.imageheight + 'px';
			this.sliceBar.style.left = this.sliceborder + 'px';
			this.sliceBar.style.top = '0px';
			this.sliceBar.style.width = this.slicewidth + 'px';
			this.sliceBar.style.height = this.imageheight + 'px';
		}

		if (left < 0)
		{
			this.sliceContainer.style.left = 0 + 'px'; 
			this.image.style.left = -left + 'px';
		}
		else
		{
			this.sliceContainer.style.left = left + leftoffset + 'px'; //place slicecontainer to center
			this.image.style.left = 0 + leftoffset + 'px'; //place image to center
		}
		if (top < 0)
		{
			this.sliceContainer.style.top = 0 + 'px';
			this.image.style.top = -top + 'px';
		}
		else
		{
			this.sliceContainer.style.top = top + 'px';
			this.image.style.top = 0 + 'px';
		}

		this.sliceContainer.style.width = this.dragwidth + 'px';
		this.sliceContainer.style.height = this.dragheight + 'px';
		this.image.style.width = this.imagewidth + 'px';
		this.image.style.height = this.imageheight + 'px';

		this.setSliceOffset(this.model.dst.cur / (this.model.dst.max - this.model.dst.min));
		

		var totwidth = (this.dragwidth > this.imagewidth) ? this.dragwidth : this.imagewidth;
		var totheight = (this.dragheight > this.imageheight) ? this.dragheight : this.imageheight;
		if (left < 0) totwidth = this.imagewidth - left * 2;
		if (top < 0) totheight = this.imageheight - top * 2;
		if (totwidth < minwidth) totwidth = minwidth; //maze adjust window to minimum size so that +- buttons don't overlap gray borders
		this.window.setDimensions(totwidth,totheight+this.textheight);


		this.feedback.style.width = totwidth + 'px';
		this.feedback.style.top = totheight + 'px';
		//maze set all divs to center of container
		this.feedbacktext.style.left = (totwidth - 80) / 2 + 'px'; //textsize=80
		this.minus.style.left = (totwidth - 80) / 2 - 20 + 'px';
		this.plus.style.left = (totwidth - 80) / 2 + 80 + 2 + 'px';
		//---end maze
	}
});


/*
 * @ author Maze February 2009
 * Gallery: Component to display a predefined list of images
 * Purpose: Intended for viewing Collections in Eurexpress (collections not available yet)
 * Future improvements: I would like to include most of the styling in the css file instead of in the Element function 
 *   for some reason the style properties are not being picked up in the css
 */
var Gallery = new Class({
	
	initialize: function(source,server,name,model,gallery) {
		this.server = server;
		this.name = name;
		this.shortName = name.toLowerCase().split(" ").join("");
		this.model = model;
		model.attach(this,[
			typeEnum.dst,
			typeEnum.dstquiet,
			typeEnum.sel
			]);
		
		this.window = new DraggableWindow(source,this.name,model);

		//maze gallery
		this.maxThumbWidth = gallery.maxthumbwidth;
		this.maxThumbHeight = gallery.maxthumbheight;
		this.showLabels = gallery.thumblabels;
		this.thumbBorder = 4; //border + padding
		this.maxTotalWidth = this.maxThumbWidth + this.thumbBorder*2;
		this.maxTotalHeight = this.maxThumbHeight + this.thumbBorder*2 + 6;
		this.maxTotalHeight = ( this.showLabels ) ? this.maxTotalHeight + 10 : this.maxTotalHeight;
		this.thumbnailnum = this.model.imgpaths.length;
		this.maxthumbvisible = 5; 
		this.moving = false;
		this.currentImage = this.model.dst.cur - 2; //-2 so that the specified current image is in the center
		this.currentPos = this.currentImage * -this.maxTotalWidth;
		this.selectedThumb = this.model.dst.cur;
		this.minIncrement = 4;
		this.maxIncrement = 10;
		this.moveamount = 0;
		this.transspeed = 300;

		this.thumblinks = new Array();
		this.thumbimages = new Array();

		var buttonsize = 16;
		this.thumbmore = new Element( 'div', {
			'id': 'more',
			'styles': {
				'title': 'Move forward x ' + this.minIncrement,
				'height': buttonsize,
				'width': buttonsize,
				'font-size': '8pt',
				'border': '1px solid gray',
				'cursor': 'pointer',
				'text-align': 'center',
				'position': 'absolute',
				'left': 36 + this.maxTotalWidth * this.maxthumbvisible + 10 + 'px',
				'bottom': this.maxTotalHeight/2 + 3 + 'px'
			}
		});
		this.thumbmore.innerHTML = '>';
		this.thumbmore.injectInside( this.window.win );

		this.thumbmore.addEvent('click', function(){ 
				this.checkbutton( this.addposition('plus', this.minIncrement) );
				this.movethumbs('minus', this.minIncrement);
			}.bind(this));

		this.thumballmore = new Element( 'div', {
			'id': 'allmore',
			'styles': { 
				'height': buttonsize,
				'width': buttonsize,
				'font-size': '8pt',
				'border': '1px solid gray',
				'cursor': 'pointer',
				'text-align': 'center',
				'position': 'absolute',
				'left': 36 + this.maxTotalWidth * this.maxthumbvisible + 10 + 'px',
				'top': this.maxTotalHeight/2 + 3 + 'px'
			}
		});
		this.thumballmore.innerHTML = '>|';
		this.thumballmore.injectInside( this.window.win );

		this.thumballmore.addEvent('click', function(){
			var new_position = this.thumbnailnum - 5;
			var move_thumbs = new_position - this.currentImage;  
			this.checkbutton( new_position );
			this.movethumbs('minus', move_thumbs);

			this.currentImage = new_position;
		}.bind(this));

		this.thumbback = new Element( 'div', {
			'id': 'back',
			'styles': {
				'title':'Move backward x ' + this.minIncrement, 
				'height': buttonsize,
				'width': buttonsize,
				'font-size': '8pt',
				'border': '1px solid gray',
				'cursor': 'pointer',
				'text-align': 'center',
				'position': 'absolute',
				'left': 10 + 'px',
				'bottom': this.maxTotalHeight/2 + 3 + 'px'
			}
		});
		this.thumbback.innerHTML = '< '; //space needed to show arrow
		this.thumbback.injectInside( this.window.win );

		this.thumbback.addEvent('click', function(){
				this.checkbutton( this.addposition('minus', this.minIncrement) );
				this.movethumbs('plus', this.minIncrement);
				
			}.bind(this));

		this.thumballback = new Element( 'div', {
			'id': 'allback',
			'styles': {
				'title':'Move backward x ' + this.maxIncrement, 
				'height': buttonsize,
				'width': buttonsize,
				'font-size': '8pt',
				'border': '1px solid gray',
				'cursor': 'pointer',
				'text-align': 'center',
				'position': 'absolute',
				'left': 10 + 'px',
				'top': this.maxTotalHeight/2 + 3 + 'px'
			}
		});
		this.thumballback.innerHTML = '|< '; //space after < needed to show arrows
		this.thumballback.injectInside( this.window.win );

		this.thumballback.addEvent('click', function(){
			var new_position = 0;
			var move_thumbs = this.currentImage;  
			this.checkbutton( new_position );
			this.movethumbs('plus', move_thumbs);

			this.currentImage = new_position;
			
		}.bind(this));

		this.thumbwindow = new Element( 'div', {
			'id': this.shortName + '-thumbwindow',
			'styles':{
				'height': '100px',
				'width': this.maxTotalWidth * this.maxthumbvisible + 'px',
				'top': '0px',
				'left': 10 + buttonsize + 10 + 'px',
				'position': 'relative',
				'overflow': 'hidden'
			}
		});
		this.thumbwindow.injectInside( this.window.win );	

		this.thumbgallery = new Element( 'div', {
			'id': this.shortName + '-thumbgallery',
			'styles':{
				'top': '6px',
				'position': 'absolute',
				'white-space': 'nowrap'
			}
		});
		this.thumbgallery.injectInside( this.thumbwindow );

		this.thumbs = new Element( 'div', {
			'id': this.shortName + '-thumbs'
		});
		this.thumbs.injectInside( this.thumbgallery );

		this.thumbcontainer = new Element( 'div', {
			'id': this.shortName + '-thumbcontainer'
		});
		this.thumbcontainer.injectInside( this.thumbs );

		this.window.setVisible(true);
		this.window.setDimensions(this.maxTotalWidth * this.maxthumbvisible + 72, this.maxTotalHeight);
		this.loadLinks(); //load all link containers for thumbnails
		this.loadThumbs( 0, this.thumbnailnum ); //load all thumbnail images
		this.loadLabels(); //load labels
		this.thumbgallery.setStyle('left', this.currentPos + 'px'); //set to specified thumbnail position
		this.checkbutton( this.currentImage ); //dis/enable buttons
		this.thumbimages[this.selectedThumb].setStyle('border', '1px solid red'); //highlight current image
	},

	//initialises all the containers for the thumb images at load time, to fix the position of each thumbnail in the sequence
	loadLinks: function(){ 
		for ( var i = 0; i < this.thumbnailnum; i++){
			this.thumblinks[i] = new Element('a', {
				'id': this.shortName + '-thumblink' + i,
				'styles':{
					'padding-top': '3px',
					'padding-right': '3px',
					'padding-bottom': '0px',
					'padding-left': '3px'
				}
			});
			this.thumblinks[i].injectInside( this.thumbcontainer );
		}	
	},

	//display labels
	loadLabels: function(){
		if ( this.showLabels ){
			//make label bar
			this.thumblabelcontainer = new Element( 'div', {
				'id': this.shortName + '-thumblabelcontainer',
				'styles':{
					'margin-top': '-5px',
					'width':78 * this.thumbnailnum + 'px' //set width of div to fit all labels so divs don't jump to next line
				}
			});
			this.thumblabelcontainer.injectInside( this.thumbs );

			//make labels
			this.thumblabels = new Array();
			for ( var i = 0; i < this.thumbnailnum; i++){
				this.thumblabels[i] = new Element( 'span', {
					'id': this.shortName + '-thumblabel' + i,
					'styles':{
						'width': '78px',
						'font-size': '7pt',
						'display': 'block',
						'float': 'left',
						'text-align': 'center'
					}
				});
				this.thumblabels[i].injectInside( this.thumblabelcontainer );
				this.thumblabels[i].innerHTML = i+1; //for now display index til collections are ready
			}
		}
	},
	
	//loads images into the links starting from pos to pos+-increment
	loadThumbs: function(pos, increment){

		var rootsrc = 'fif=' + this.model.fspath + this.model.stackPath + 'images/'; 
		var startpos = ( increment < 0 ) ? pos+increment : pos;
		var endpos = ( increment < 0 ) ? pos : pos+increment;
		
		for ( var i = startpos; i < endpos; i++ ){ 

			if ( !$chk(this.thumbimages[i]) ){
				var fullsrc = rootsrc + this.model.imgpaths[i];
				
				var navsrc = this.server + '?' +
						fullsrc + '&wid=' + 
						this.maxThumbWidth + 'qlt=' + 
						this.model.qlt.cur + '&cvt=jpeg';
				this.thumbimages[i] = new Element('img', {
					'id': this.shortName + '-thumbimage' + i,
					'src': navsrc,
					'indexpos': i,
					'title': 'Section:' + (i + 1),
					'styles':{
						'width': this.maxThumbWidth + 'px',
						'height': this.maxThumbHeight + 'px',
						'border': '1px solid #CCC'
					}
				}); 
				this.thumbimages[i].thumbindex = i;

				this.thumbimages[i].addEvent('click', function(event){
					var el = event.target;
					//update border
					el.setStyle('border', '1px solid red');
					this.thumbimages[this.selectedThumb].setStyle('border', '1px solid #CCC');
					//update main image
					this.model.setVals(['dst'],[el.thumbindex], false, 'gallery');
					//update previously selected image
					this.selectedThumb = el.thumbindex;

					var new_current = el.thumbindex - 2;
					var move_thumbs = new_current - this.currentImage;
					if (new_current > this.currentImage){
						this.checkbutton( new_current );
						this.movethumbs('minus', move_thumbs);
						
					}
					else {
						this.checkbutton( new_current );
						this.movethumbs('plus', -move_thumbs);
					}
					this.currentImage = new_current;
			
				}.bind(this)); 

				this.thumbimages[i].addEvent('mouseover', function(event){
					var el = event.target;
					if ( this.selectedThumb != el.thumbindex ) el.setStyle('border', '1px solid yellow');
				}.bind(this)); 

				this.thumbimages[i].addEvent('mouseleave', function(event){
					var el = event.target;
					if ( this.selectedThumb != el.thumbindex ) el.setStyle('border', '1px solid #CCC');
				}.bind(this)); 

				this.thumbimages[i].injectInside( this.thumblinks[i] );
				
			}
		}
	},

	//does not work at the moment
	getImageWidth: function(){
		alert('this.model.fullImage.width = ' + this.model.fullImage.width);
		//this.model.fullImage.width is undefined until it is accessed the first time in the alert above
		var w = this.maxThumbWidth / this.model.fullImage.width;
		var scale = ( w < h ) ? w : h;
		alert('scale = ' + scale + 'this.model.fullImage.width = ' + this.model.fullImage.width);
		return scale;
	},

	addposition: function(addwidth, thumbnails){
		if ( !this.moving ) {
			// if animagic is still moving the image..don't update the current position till it's done
			if(addwidth=="minus"){
				this.currentImage-=thumbnails;
			}else if(addwidth=="plus"){
				this.currentImage+=thumbnails;
			}
		}
		return this.currentImage;
	},

	checkbutton: function(mynum){
		//this.thumbbackindex.innerHTML = mynum;
		//this.thumbmoreindex.innerHTML = (mynum + 4 >= this.thumbnailnum ) ? this.thumbnailnum : mynum + 4;

		//if ( mynum <= this.maxIncrement ){
		if ( mynum <= 0 ){
			this.mm_shl('allback','hidden');
			//this.mm_shl('maxback','hidden');
			if ( mynum <= 0 ) this.mm_shl('back','hidden');
			else this.mm_shl('back', 'visible');
		} else {
			//this.mm_shl('maxback','visible');
			this.mm_shl('back','visible');
			this.mm_shl('allback','visible');
		}

		//if ( mynum >= this.thumbnailnum-1 - this.maxIncrement ){
		if ( mynum >= this.thumbnailnum -  5 ){
			this.mm_shl('allmore','hidden');
			//this.mm_shl('maxmore','hidden');
			if ( mynum >= this.thumbnailnum-1 ) this.mm_shl('more','hidden');
			else this.mm_shl('more','visible');
		} else {
			this.mm_shl('more','visible');
			this.mm_shl('allmore','visible');
			//this.mm_shl('maxmore','visible');
		}
	},

	mm_shl: function() { //v6.0
		var obj,args=arguments;
		if ( ( obj = this.MM_findObj(args[0]) )!=null ) {
			if (obj.style) {
				obj=obj.style;
			}
			obj.visibility=args[1];
		}
	},

	MM_findObj: function(n, d) { //v4.01
		var p, i, x;  
		if( !d ) d=document; 
		if( ( p = n.indexOf("?") ) > 0 && parent.frames.length ) {
			d = parent.frames[n.substring(p+1)].document; 
			n = n.substring(0,p);
		}
		if( !( x=d[n] ) && d.all ) x=d.all[n]; 
		for ( i = 0; !x && i < d.forms.length; i++ ) 
			x = d.forms[i][n];
		for( i = 0;!x && d.layers && i<d.layers.length; i++ ) 
			x = MM_findObj( n, d.layers[i].document );
		if( !x && d.getElementById ) 
			x = d.getElementById(n); 
		return x;
	},

	movethumbs: function(way, thumbnails){
		this.moveamount = thumbnails * this.maxTotalWidth;
		if(way=='plus'){
			move=( this.currentPos + this.moveamount );
			var movethumbs = new Fx.Morph(this.shortName + '-thumbgallery', {duration: this.transspeed, transition: Fx.Transitions.Quad.easeOut});
			movethumbs.start({ left: [this.currentPos, move]});
			this.currentPos += this.moveamount;
		}else if(way=='minus'){
			move=( this.currentPos - this.moveamount );
			var movethumbs = new Fx.Morph(this.shortName + '-thumbgallery', {duration: this.transspeed, transition: Fx.Transitions.Quad.easeOut});
			movethumbs.start({ left: [this.currentPos, move]});
			this.currentPos -= this.moveamount;
		}
	},

	handleDrag: function(done) {

		this.model.setVals(['dst'],[
				this.getSliceOffset()
				* (this.model.dst.max - this.model.dst.min)
			],!done,'selector');
	},


	update: function(types, trigger)
	{
		/* Maze: maybe link Selector updates here, not urgent because Gallery should not be used in conjunction Selector except in demo site */
		this.window.setVisible(true);

		this.window.setDimensions(this.maxTotalWidth * this.maxthumbvisible + 72, this.maxTotalHeight);//maze gallery
	}
});



/*
 * @ author Maze March 2009
 * ContextMenu: Custom built right click context menu, disable default menu
 * Purpose: At the moment 2 items - save image and open image in new window
 */

var ContextMenu = new Class({

	initialize: function(source, contextmenu, options, model, annolayer, types) {

		this.shortName = contextmenu.name;
		this.options = options;
		this.model = model;
		this.annolayer = annolayer;
		this.currentImage = this.model.dst.cur + 1;
		this.currentImgStr = (this.currentImage.toString().length = 1) ? '0' + this.currentImage.toString() : this.currentImage.toString();
		this.currentAssay = options.assayid;
		this.assayImageID = this.currentAssay + '_' + this.currentImage.toString() + '.jpg';
		this.menuContents = new Array('Labels Off', 'Save Full Image...', 'View Image Only...', 'View Assay...', 'Reset');

		//attach model to this component for updates
		model.attach(this,types);

		this.menuitems = new Array();
		this.menuitemlinks = new Array();

		this.menushadow = new Element( 'div', {
			'id': this.shortName + '-menushadow',
			'class': 'p-shadow',
			'styles':{
				'display': 'none',
				'position': 'absolute'
			}
		});

		this.menu = new Element( 'div', {
			'id': this.shortName + '-contextmenu'
		});
		this.menu.injectInside( this.menushadow );

		//content of menu
		this.menulist = new Element( 'ul', {
			'id': 'context-menu'
		});

		for ( i=0; i<this.menuContents.length; i++){
			this.menuitems[i] = new Element( 'li', {
				'id': this.shortName + '-menuitem' + i,
				'styles':{
					'margin': 0,
					'padding': 0
				}
			});
			this.menuitemlinks[i] = new Element( 'a', {
				'id': this.shortName + '-menulink' + i,
				'styles':{
					'display': 'block',
					'padding': '3px 10px 3px 15px',
					'text-decoration': 'none',
					'background-position': '8px 8px',
					'background-repeat': 'no-repeat',
					'color': 'black',
					'cursor': 'default'
				}
			});
			this.menuitemlinks[i].innerHTML = this.menuContents[i];

			this.menuitemlinks[i].addEvent('mouseover', function(event){
				var el = event.target;
				el.setAttribute( 'prev-color', el.getStyle('color') );
				el.setStyle('background-color', '#435090');
				el.setStyle('color', 'white');
			}.bind(this)); 
			this.menuitemlinks[i].addEvent('mouseleave', function(event){
				var el = event.target;
				el.setStyle('background-color', '#fff');
				el.setStyle('color', el.getAttribute('prev-color') );
			}.bind(this));

			this.menuitemlinks[i].injectInside( this.menuitems[i] );
			this.menuitems[i].injectInside( this.menulist );
		}

		this.menuitemlinks[0].addEvent('click', function(event){		
			var el = event.target;

			if ( parseFloat(this.annolayer.opacity) > 0 ){
				this.annolayer.overlayFrameContainer.setStyle('opacity', '0');
				this.annolayer.overlayFrame.setStyle('opacity','0');
				this.annolayer.opacity = '0';
				el.innerHTML = 'Labels On';
			}
			else{
				this.annolayer.overlayFrameContainer.setStyle('opacity', '1.0');
				this.annolayer.overlayFrame.setStyle('opacity', '1.0');
				this.annolayer.opacity = '1.0';
				el.innerHTML = 'Labels Off';
			}
		}.bind(this));

		this.menuitemlinks[1].addEvent('click', function(event){
			this.hideMenu();
			if ( this.currentAssay==''){//maze: find some better way to determine whether it is an Eurexpress downloadable image
				alert('The current image is not available for download!');
			}
		}.bind(this));

		this.menuitemlinks[2].addEvent('click', function(event){
			if ( this.model.wlz && this.options.stack!='/export/system1/MAWWW/html/mrciip/projects/wlziip/TS18Model.wlz' )
				window.open("http://aberlour.hgu.mrc.ac.uk/wlziipviewer/wlziipviewer_cluster.php?" + this.phpArgs + "&external", 'EurexpressViewer', 'width=1000, height=1000, location=1, scrollbars=1, resizable=1'); //ie doesn't accept spaces in 2nd arg
			else
				window.open("http://aberlour.hgu.mrc.ac.uk/wlziipviewer/wlziipviewer.php?" + this.phpArgs + "&external", 'EurexpressViewer', 'width=1000, height=1000, location=1, scrollbars=1, resizable=1');
		}.bind(this));

		this.menuitemlinks[3].addEvent('click', function(event){
			if ( this.currentAssay!='' && this.options.external ) //maze: find some better way to determine whether it is being called from Eurexpress
				window.location.replace("http://www.eurexpress.org/ee/databases/assay.jsp?assayID=" + this.currentAssay + "&external=1");
		}.bind(this));
		if ( !this.options.external ) this.menuitemlinks[3].setStyle('color', 'gray');
		//content of menu end

		this.menulist.injectInside( this.menu );
		this.menushadow.injectInside( source );
	},

	showMenu: function(e)
	{
		var framewidth = $(this.options.source).getWidth();
		var frameheight = $(this.options.source).getHeight();
		var menuwidth = framewidth * 0.2;
		var menuheight = 80;
		
		this.menushadow.setStyle('display', '');
		if ( e.client.x+menuwidth > framewidth )
			this.menushadow.setStyle('left', e.client.x-menuwidth);
		else 
			this.menushadow.setStyle('left', e.client.x-5);

		if ( e.client.y+menuheight > frameheight )
			this.menushadow.setStyle('top', e.client.y-menuheight-10);
		else
			this.menushadow.setStyle('top', e.client.y-10);
	},

	hideMenu: function()
	{
		this.menushadow.setStyle('display', 'none');
	},

	getPhpArguments: function(options){
		var args = 'stack=' + options.stack + '&';

		//alert('short name = ' + this.shortName);
		args = args + 'initialdst=' + this.currentImage + '&';

		if (options.sectionplane.enable)
			args = args + 'sectionplane&'; 
		if (options.dstslider.enable) 
			args = args + 'dstslider&';
		if (options.selector.enable) 
			args = args + 'selector&';
		if (options.gallery.enable) 
			args = args + 'gallery&';
		if (options.gallery.thumblabels)
			args = args + 'thumblabels&';
		if (options.assayid != '')
			args = args + 'assayid='+ options.assayid + '&';
		if ( $defined(options.imgtitle) )
			args = args + 'imgtitle='+options.imgtitle + '&';
		args = args.substring(0, args.length-1);

		return args;
	},

	resetDownloadLink: function(){
		if (this.currentAssay != ''){ //maze: find some better way to determine whether it is an Eurexpress downloadable image
			this.assayImageID = this.currentAssay + '_' + this.currentImgStr.toString() + '.jpg';
			this.menuitemlinks[1].setProperty('href', 'http://www.eurexpress.org/ee/createzipfile?assayImageID=' + this.assayImageID);
		}
		else{
			//this.menuitemlinks[1].setProperty('href', ''); //forces page to refresh
		}	
	},

	update: function(types, triggers){
		//called everytime the image is changed (dst), update current image download link
		this.currentImage = this.model.dst.cur + 1;
		this.currentImgStr = (this.currentImage.toString().length==1) ? '0' + this.currentImage.toString() : this.currentImage.toString();
		this.currentAssay = this.options.assayid;
		//change the download image link
		this.resetDownloadLink();
		//get php parameters
		this.phpArgs = this.getPhpArguments(this.options);
	}

});

