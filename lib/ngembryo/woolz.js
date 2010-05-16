/**
 * @classDescription This encapsulates an IIP manager (based on Woolz IIP Viewer).
 * @author gyaikhom
 * @version 0.0.1
 */

/**
 * Thoroughly revised from the version of Woolz IIP Viewer
 * Copyright (c) 2008 Tom Perry    <Tom.Perry@hgu.mrc.ac.uk>
 * Chris Tindal <Chris.Tindal@hgu.mrc.ac.uk>
 * Mei Sze Lam <meiszel@hgu.mrc.ac.uk>
 * 
 * for use with the HGU Woolz IIP server:
 * Zsolt Husz   <Zsolt.Husz@hgu.mrc.ac.uk>
 * 
 * based on IIPImage Javascript Viewer <http://iipimage.sourceforge.net>
 * Version 1.0
 * Copyright (c) 2007 Ruven Pillay <ruven@users.sourceforge.net>
 * Built using the Mootools javascript framework <http://www.mootools.net>
 * 
 * For further details on the original implementation, please visit:
 * http://aberlour.hgu.mrc.ac.uk/
 */

/**
 * Common code used to initialise MooTools drag classes.
 */
function getDragOpts(container, updateDelay, bind, handle) {
	return {
		container : container,
		snap : 0,
		handle : handle,
		onStart : function() {
			this.dragging = false;
			this.updateDelay = updateDelay;
		}.bind(bind),
		onDrag : function() {
			if (!this.dragging) {
				this.handleDrag(false);
				if (this.updateDelay != 0) {
					this.dragging = true;
					setTimeout(function() {
						this.dragging = false;
					}.bind(bind), this.updateDelay);
				}
			}
		}.bind(bind),
		onComplete : function() {
			this.handleDrag(true);
		}.bind(bind)
	};
}

var typeEnum = new Object( {
	loading : 0,
	scroll : 1,
	viewport : 2,
	scl : 3,
	dst : 4,
	pit : 5,
	yaw : 6,
	rol : 7,
	pitquiet : 8,
	yawquiet : 9,
	sel : 10,
	all : 11,
	dstquiet : 12,
	context : 13,
	ovl : 14
});

var WlzIIPViewer = new Class(
		{
			initialize : function(options) {
				this.model = new Model(options.server, options.stack,
						options.webpath, options.fspath, options.assayid,
						options.initialdst);
				document.body.style.overflow = 'hidden';
				document.documentElement.style.overflow = "hidden";
				if (options.tileframe.enable)
					this.tileframe = new TileFrame(options.source, this.model);
				if (options.locator.enable)
					this.locator = new Locator("roiControl", options.server,
							this.model);
				if (options.sectionplane.enable)
					this.sectionPlane = new SectionPlane("secControl",
							options.server, this.model, options.sectionplane);
				this.model.getMetadata(options.stack);
			},

			destroy : function() {
				var node = dojo.byId("woolz");
				this.sectionPlane.destroy();
				this.locator.destroy();
				this.tileframe.destroy();
				this.model.destroy();
				destroyChildSubtree(node);
			},

			refresh : function() {
				this.model.setVals(['scl'], [this.model.scl.cur], true, 'mouse');
			},
			
			mouseZoom : function(value) {
				if (value > 0) {
					newscl = this.model.scl.cur * 2;
				} else {
					if (value < 0) {
						newscl = this.model.scl.cur / 2;
					}
				}
				this.model.setVals( [ 'scl' ], [ newscl ], false, 'mouse');
			}
		});

var Model = new Class(
		{
			initialize : function(server, filename, webpath, fspath, assayid,
					initialdst) {
				this.registry = new Array();
				this.server = server;
				this.webpath = webpath;
				this.fspath = fspath;
				this.assayid = assayid;
				this.initialdst = initialdst;
				this.image = new Object();
				this.tileSize = new Object();
				this.viewport = new Object();
				this.setViewportSize(window.getWidth(), window.getHeight());
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
					this.setVals( [ 'scl' ], [ this.scl.cur * 2 ], false,
							'unknown');
				}.bind(this);
				this.scl.decrement = function() {
					this.setVals( [ 'scl' ], [ this.scl.cur / 2 ], false,
							'unknown');
				}.bind(this);
				this.dst = new Object();
				this.dst.min = 0;
				this.dst.max = 0;
				if ($defined(initialdst) && !isNaN(parseInt(initialdst, 10)))
					this.dst.cur = parseInt(initialdst, 10) - 1;
				this.dst.increment = function() {
					this.setVals( [ 'dst' ], [ this.dst.cur + 1 ], false,
							'unknown');
				}.bind(this);
				this.dst.decrement = function() {
					this.setVals( [ 'dst' ], [ this.dst.cur - 1 ], false,
							'unknown');
				}.bind(this);
				this.ovl = new Object();
				this.ovl.cur = 0.6;
				this.ovl.min = 0.1;
				this.ovl.max = 1;
				this.ovl.inc = 0.1;
				this.ovl.increment = function() {
					this.setVals( [ 'ovl' ], [ this.ovl.cur + 0.1 ], false,
							'unknown');
				}.bind(this);
				this.ovl.decrement = function() {
					this.setVals( [ 'ovl' ], [ this.ovl.cur - 0.1 ], false,
							'unknown');
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
			},

			destroy : function() {
				this.registry = null;
				this.image = null;
				this.tileSize = null;
				this.viewport = null;
				this.viewable = null;
				this.fullWlzObject = null;
				this.fullImage = null;
				this.zsel = null;
				this.fxp = null;
				this.scl = null;
				this.dst = null;
				this.ovl = null;
				this.pit = null;
				this.yaw = null;
				this.rol = null;
				this.qlt = null;
				this.roi = null;
			},

			/**
			 * This function will attach an observer to an event. The type of
			 * events are determined and monitored by the WoolzIIPViewer object.
			 * When an event of the listed type is observed, the supplied
			 * observer is notified.
			 * 
			 * @param observer
			 *            The component that should be notified.
			 * @param types
			 *            List of event types that the observer wants notified.
			 */
			attach : function(observer, types) {
				this.registry.push(new Object( {
					component : observer,
					types : types
				}));
			},

			/**
			 * When an event is observed by the WoolzIIPViewer, all of the
			 * observers that are registered to receive the event should be
			 * notified. This is done by triggering the event handlers,
			 * registered for the event. The actual triggering is carried out by
			 * invoking the update() method which is implemented by every
			 * observer registered.
			 * 
			 * @param types
			 *            List of event types that the observer will be notified
			 *            of.
			 * @param trigger
			 *            The event handler.
			 */
			notify : function(types, trigger) {
				for ( var i = 0; i < this.registry.length; i++) {
					var found = false;
					var j = 0;
					while (!found && j < types.length) {
						if (types[j] == typeEnum.all
								|| this.registry[i].types.indexOf(types[j]) != -1) {
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
			 * @param url
			 *            The url to load.
			 * @param callback
			 *            The function into which the response should be fed.
			 * @param failQuietly
			 *            If false or undefined, an alert will appear if the
			 *            data cannot be loaded. If true, no alert will appear.
			 * @param async
			 *            If true or undefined, the request will be
			 *            asynchronous. If false, the request will be
			 *            synchronous (i.e. will block)
			 */
			getURL : function(url, callback, failQuietly, async) {
				if (!$defined(async))
					async = true;
				new Request( {
					url : url,
					method : 'get',
					async : async,
					onSuccess : function(transport) {
						var response = transport
								|| "No response from Woolz server.";
						callback(response);
					}.bind(this),
					onFailure : function() {
						if (!$chk(failQuietly))
							alert('Unable to fetch data at "' + url + '"');
					}
				}).send();
			},

			/**
			 * Requests IIP objects from an IIP server.
			 * 
			 * Object names are passed in an array, an Ajax request is sent to
			 * the server and corresponding values are passed to the callback
			 * function.
			 * 
			 * @author Tom Perry
			 * 
			 * @param objs
			 *            An array of object names to load.
			 * @param callback
			 *            The function into which the values corresponding to
			 *            the requested objects should be fed.
			 * @param async
			 *            If true or undefined, the request will be
			 *            asynchronous. If false, the request will be
			 *            synchronous (i.e. will block)
			 */
			getObjects : function(objs, callback, async) {
				if (!objs[0])
					callback();
				var url;
				if (this.wlz) {
					url = this.server + "?" + this.fif + "&mod=" + this.mode
							+ "&fxp=" + this.fxp.x + ',' + this.fxp.y + ','
							+ this.fxp.z + "&dst=" + this.dst.cur + "&pit="
							+ this.pit.cur + "&yaw=" + this.yaw.cur + "&rol="
							+ this.rol.cur;
				} else {
					url = this.server + "?" + this.fif;
				}

				/* Check for invalid object request to the Woolz server. */
				for ( var i = 0; i < objs.length; i++) {
					if (this.wlz && objs[i] == "Resolution-number")
						alert("Error: Resolution-number IIP object not supported for Woolz objects.");
					if (!this.wlz && objs[i] == "Wlz-distance-range")
						alert("Error: Wlz-distance-range IIP object not supported for non-Woolz objects.");
					url += "&obj=" + objs[i];
					if (objs[i] == "IIP")
						url += ",1.0";
				}

				/*
				 * Handles the response received from the Woolz server after an
				 * Object request.
				 */
				var getObjectsCallback = function(response) {
					var i;
					var vals = new Array(objs.length);
					vals[0] = response.split(objs[0] + ":")[1];

					/* Retrieve object name/value pairs. */
					for (i = 0; i < objs.length - 1; i++) {
						if (!vals[i]) {
							if (response.split("\r")[0] == "Error/7:1 3 FIF") {
								alert("Cannot load image data from "
										+ this.fif.split("fif=")[1]);
							} else {
								if (response.split("\r")[0] == "Error/7:2 2 wlz") {
									alert("Cannot load Woolz data: unsupported by server.");
								} else {
									alert("Unexpected response from IIP server:\n"
											+ response);
								}
							}
							return;
						}
						vals[i + 1] = vals[i].split(objs[i + 1] + ":")[1];
						vals[i] = vals[i].split(objs[i + 1] + ":")[0]
								.split("\r")[0];
					}

					/* Process each of the name/value pairs. */
					for (i = 0; i < objs.length; i++) {
						switch (objs[i]) {
						case "Max-size":
							/*
							 * The maximum size of the entire image in the given
							 * resolution.
							 */
							this.fullImage.width = parseInt(vals[i].split(" ")[0]);
							this.fullImage.height = parseInt(vals[i].split(" ")[1]);
							this.setWinMinScl();
							break;

						case "Resolution-number":
							/* The number of image resolutions for this model. */
							this.maxiipres = parseInt(vals[i]) - 1;
							this.setIIPMinScl();
							break;

						case "Wlz-distance-range":
							/* The range of the sectioning plane distance. */
							this.dst.min = parseInt(vals[i].split(" ")[0]);
							this.dst.max = parseInt(vals[i].split(" ")[1]);
							if (this.dst.cur < this.dst.min) {
								this.dst.cur = this.dst.min;
							}
							if (this.dst.cur > this.dst.max) {
								this.dst.cur = this.dst.max;
							}
							break;

						case "Wlz-3d-bounding-box":
							/*
							 * The first and last plane, line and column number
							 * of the object.
							 */
							this.fullWlzObject.z.min = parseInt(vals[i]
									.split(" ")[0]);
							this.fullWlzObject.z.max = parseInt(vals[i]
									.split(" ")[1]);
							this.fullWlzObject.y.min = parseInt(vals[i]
									.split(" ")[2]);
							this.fullWlzObject.y.max = parseInt(vals[i]
									.split(" ")[3]);
							this.fullWlzObject.x.min = parseInt(vals[i]
									.split(" ")[4]);
							this.fullWlzObject.x.max = parseInt(vals[i]
									.split(" ")[5]);
							break;

						case "Tile-size":
							/*
							 * The size of each image tile for a given
							 * resolution.
							 */
							this.tileSize.width = parseInt(vals[i].split(" ")[0]);
							this.tileSize.height = parseInt(vals[i].split(" ")[1]);
							break;
						}
					}

					callback(vals);
				}.bind(this);
				this.getURL(url, getObjectsCallback, false, async);
			},

			/**
			 * Since a (non-Woolz) stack is simply a collection of images, we
			 * need an extra metadata file to store information on the stack as
			 * a whole that cannot be determined from IIP objects which describe
			 * individual images.
			 * 
			 * We store this metadata in JSON format in the server's filesystem
			 * and load it here.
			 * 
			 * @author Tom Perry
			 * 
			 * @param filename
			 *            The location of the image stack on the server. If the
			 *            file is a Javascript metadata object, the path is
			 *            relative to the web root; if it's a Woolz object, the
			 *            path is an absolute location on the server's
			 *            filesystem.
			 */
			getMetadata : function(filename) {
				/*
				 * This method handles image stack stored using JSON metadata.
				 * 
				 * NOTE: This is of little use to the NG-Embryo project because
				 * we only support Woolz models (for the duration of the
				 * project).
				 */
				var handleJSONStack = function(response) {
					if (!response) {
						alert("Could not load image stack metadata.");
						return;
					}
					var jso = eval("(" + response + ")");
					var meta_ver = "1.0";
					if ($chk(jso.metadata_version))
						meta_ver = jso.metadata_version;
					switch (meta_ver) {
					case "1.0":
						if ($chk(this.assayid)) {
							this.imgarr = new Array();
							if ($chk(jso.image)) {
								for ( var i = 0; i < jso.image.length; i++) {
									if (jso.image[i].jsopath.length == jso.image[i].jsopath
											.lastIndexOf(".js") + 3)
										this.imgarr
												.push(jso.image[i].jsopath
														.substring(
																0,
																jso.image[i].jsopath.length - 3));
									else
										this.imgarr.push(jso.image[i].jsopath);
								}
								this.imgpaths = this.imgarr;
								this.dst.max = this.imgpaths.length - 1;
							} else {
								alert("No images defined in JS file");
								return;
							}

							if (!$defined(this.dst.cur)
									|| this.dst.cur > this.dst.max
									|| this.dst.cur < this.dst.min) {
								this.dst.cur = Math.round(this.dst.min
										+ (this.dst.max - this.dst.min) / 2);
							}

							var folderno = parseInt(this.assayid.substring(9,
									13), 10);
							this.stackPath = "ee_maze/" + folderno + "/"
									+ this.assayid + "/";
							this.imageExtension = "";
						} else {
							alert("Old version of of metadata JS file cannot be loaded");
						}
						this.getfif = function() {
							this.filename = this.imgpaths[Math
									.round(this.dst.cur)];
							return 'fif=' + this.fspath + this.stackPath
									+ 'images/' + this.filename;
						}.bind(this);
						break;
					case "1.1":
						if ($chk(jso.image)) {
							this.imgpaths = jso.image;
						} else {
							alert("No images defined in JS file");
							return;
						}

						if ($chk(jso.image.length))
							this.dst.max = jso.image.length - 1;

						if (!$defined(this.dst.cur)
								|| this.dst.cur > this.dst.max
								|| this.dst.cur < this.dst.min) {
							this.dst.cur = Math.round(this.dst.min
									+ (this.dst.max - this.dst.min) / 2);
						}

						this.stackPath = jso.stackpath;
						this.getfif = function() {
							this.filename = this.imgpaths[Math
									.round(this.dst.cur)];
							return 'fif=' + this.fspath + this.stackPath
									+ 'images/' + this.filename;
						}.bind(this);
						this.imageExtension = "";
						break;
					case "1.12":
						if ($chk(jso.image)) {
							this.imgpaths = jso.image;
							this.overlaypaths = jso.overlay;
							this.annopaths = jso.annotation;
						} else {
							alert("No images defined in JS file");
							return;
						}

						if ($chk(jso.image.length))
							this.dst.max = jso.image.length - 1;

						if (!$defined(this.dst.cur)
								|| this.dst.cur > this.dst.max
								|| this.dst.cur < this.dst.min) {
							this.dst.cur = Math.round(this.dst.min
									+ (this.dst.max - this.dst.min) / 2);
						}

						this.stackPath = jso.stackpath;
						this.getfif = function() {
							this.filename = this.imgpaths[Math
									.round(this.dst.cur)];
							return 'fif=' + this.fspath + this.stackPath
									+ 'images/' + this.filename;
						}.bind(this);
						this.getovlfif = function() {
							this.ovlfilename = this.overlaypaths[Math
									.round(this.dst.cur)];
							return 'fif=' + this.fspath + this.stackPath
									+ 'images/' + this.ovlfilename;
						}.bind(this);
						this.imageExtension = "";
						break;
					case "1.02":
						if ($chk(jso.file_root))
							this.imgpaths = jso.file_root;
						else {
							alert("No images defined in JS file");
							return;
						}

						if ($chk(jso.file_root.length))
							this.dst.max = jso.file_root.length - 1;

						if (!$defined(this.dst.cur)
								|| this.dst.cur > this.dst.max
								|| this.dst.cur < this.dst.min) {
							this.dst.cur = Math.round(this.dst.min
									+ (this.dst.max - this.dst.min) / 2);
						}

						this.stackPath = jso.stackpath;
						this.imagePath = jso.imagepath;
						this.imageExtension = jso.image_extension;
						if ($chk(jso.overlaypath)) {
							this.hasOverlays = true;
							this.overlayPath = jso.overlaypath;
							this.overlaySuffix = jso.overlaysuffix;
						}
						this.getfif = function() {
							this.filename = this.imgpaths[Math
									.round(this.dst.cur)];
							return 'fif=' + this.fspath + this.stackPath
									+ 'images/' + this.filename
									+ this.imageExtension;
						}.bind(this);
						break;
					}

					if ($chk(jso.zselwidth) && $chk(jso.zselheight)
							&& $chk(jso.zsliceorientation)) {
						this.zsel.width = jso.zselwidth;
						this.zsel.height = jso.zselheight;
						this.zsel.border_tl = jso.zseldragborderlefttop;
						this.zsel.border_br = jso.zseldragborderrightbottom;
						this.zsel.orientation = jso.zsliceorientation;
						this.selsrc = this.webpath + this.stackPath
								+ jso.zsimgsrc;
						this.hasZSel = true;
					}

					if ($chk(jso.domain_mapping)) {
						this.getURL(jso.domain_mapping, function(response) {
							this.anatomyTerms = eval("(" + response + ")");
						}.bind(this), false, false);
					}

					this.fif = this.getfif();
					this.getMetadata(this.filename + this.imageExtension);
				}.bind(this);

				switch (filename.length) {
				case (filename.lastIndexOf(".wlz") + 4):
					/* Image stack is a Woolz model. */
					this.wlz = true;
					this.scl.max = 4;
					if (!$defined(this.fif))
						this.fif = "wlz=" + filename;
					this.getIIPMetadata();
					break;

				case (filename.lastIndexOf(".tif.js") + 7):
				case (filename.lastIndexOf(".tif") + 4):
				case (filename.lastIndexOf(".tiff") + 5):
					/* Image stack is TIFF, or TIFF extension. */
					this.wlz = false;
					this.scl.max = 1;
					if (!$defined(this.fif))
						this.fif = "fif=" + filename;
					this.getIIPMetadata();
					break;

				case (filename.lastIndexOf(".js") + 3):
					/* Image stack metadata stored is JSON file. */
					this.getURL(filename, handleJSONStack, false, false);
					break;

				default:
					alert("Invalid image resource:\n" + filename);
					break;
				}
			},

			/**
			 * Requests all relevant data that is accessible via the IIP server
			 * (i.e. not data that is stored in metadata files, which is
			 * requested by getStack() )
			 * 
			 * @author Ruven Pillay/Tom Perry
			 */
			getIIPMetadata : function() {
				var async = false;

				/* Process metadata for the 3D bounding box. */
				var handleWlz3dBoundingBox = function(vals) {
					/* First adjust the fixed-point. */
					this.fxp.x = Math
							.round((this.fullWlzObject.x.max + this.fullWlzObject.x.min) / 2);
					this.fxp.y = Math
							.round((this.fullWlzObject.y.max + this.fullWlzObject.y.min) / 2);
					this.fxp.z = Math
							.round((this.fullWlzObject.z.max + this.fullWlzObject.z.min) / 2);

					this.getObjects(
							new Array("Max-size", "Wlz-distance-range"),
							function(vals) {
								this.notify( [ typeEnum.all ]);
								this.notify( [ typeEnum.sclextents ]);
							}.bind(this), async);
				}.bind(this);

				/* Process Woolz IIP server metadata. */
				var handleMetadata = function(vals) {
					if (this.wlz) {
						this.getObjects(new Array("Wlz-3d-bounding-box"),
								handleWlz3dBoundingBox, async);
					} else {
						this.getObjects(new Array("Max-size",
								"Resolution-number"), function(vals) {
							this.notify( [ typeEnum.all ]);
							this.notify( [ typeEnum.sclextents ]);
						}.bind(this), async);
					}
				}.bind(this);

				this.getObjects(new Array("IIP", "IIP-server", "Tile-size"),
						handleMetadata, async);
			},

			/**
			 * Sets the maximum scale allowed on the model.
			 */
			setMaxScl : function() {
				/* All Woolz models have four resolutions. */
				if (this.wlz) {
					this.maxScl = this.minScl * 8;
				} else {
					this.maxScl = 1;
				}
			},

			/**
			 * Fixes the minimum scale.
			 */
			fixMinScl : function() {
				if (!$defined(this.minScl))
					console.error("Minimum scale is not defined.");

				/*
				 * For Woolz models, there are four resolutions. For other image
				 * stacks, find the minimum scale from the resolutions available
				 * on the image stack (using the stack metadata).
				 */
				if (!this.wlz)
					this.minScl = this.res2scl(this.scl2res(this.minScl, true));
			},

			/**
			 * Fixes the region-of-interest.
			 */
			fixROI : function() {
				/*
				 * When this.xfit is true, the entire image fits inside the
				 * viewport. In this case, we position the region of interest in
				 * the horizontal midpoint. This is because, the actual
				 * region-of-interest is created with reference to this midpoint
				 * (half on the left, half on the right).
				 */
				if (this.xfit) {
					this.roi.x = 0.5;
				} else {
					if (this.roi2vpLeft2() < 0) {
						this.roi.x = this.vpl2roi(0);
					} else {
						if (this.roi2vpLeft2() + this.viewport.width > this.image.width)
							this.roi.x = this.vpl2roi(this.image.width
									- this.viewport.width);
					}
				}

				/* Same as above, but for the vertical adjustment. */
				if (this.yfit) {
					this.roi.y = 0.5;
				} else {
					if (this.roi2vpTop2() < 0) {
						this.roi.y = this.vpt2roi(0);
					} else {
						if (this.roi2vpTop2() + this.viewport.height > this.image.height)
							this.roi.y = this.vpt2roi(this.image.height
									- this.viewport.height);
					}
				}
			},

			/**
			 * Handles changes to parameters that affect the orientation of the
			 * section plane with respect to the model (e.g., scale, yaw etc.).
			 * This method is invoked by setVal() method, and specifically
			 * handles notifications.
			 * 
			 * @param types
			 *            Type of parameters.
			 * @param quiet
			 *            Should the changes be visible to the user.
			 * @param trigger
			 *            Which registered observers to notify.
			 */
			handleVariableChange : function(types, quiet, trigger) {
				/* Did the orientation change. */
				var flag = false;
				/* Objects that are required to complete the variable change. */
				var requiredObjects;

				/*
				 * Which types of event notifications are affected by this
				 * parameter change? For instance, the region-of-interest should
				 * be updated when the scale is change. This means that a
				 * notification should be sent to the Locator panel.
				 */
				var notifications = new Array();

				/*
				 * Parameter changes could come in groups. So, each of these
				 * changes should be handled one-by-one.
				 */
				for ( var i = 0; i < types.length; i++) {
					switch (types[i]) {
					case 'dst':
						/*
						 * Changes to the distance of the section plane relative
						 * to the current position. The angular orientation is
						 * not altered.
						 */
						if (!this.wlz)
							this.fif = this.getfif();
						if ($chk(quiet)) {
							notifications.push(typeEnum.dstquiet);
						} else {
							if (this.wlz)
								requiredObjects = new Array("Max-size");
							else
								requiredObjects = new Array("Max-size",
										"Resolution-number");
							notifications.push(typeEnum.dst);
							notifications.push(typeEnum.sclextents);
						}
						flag = true;
						break;

					case 'scl':
						/* Changes to the scale. */
						this.handleSclChange();
						notifications.push(typeEnum.scl);
						break;

					case 'pit':
						/*
						 * Changes to the angular orientation of the section
						 * plane. We are changing the Pitch.
						 */
						requiredObjects = new Array("Max-size",
								"Wlz-distance-range");
						if ($chk(quiet)) {
							notifications.push(typeEnum.pitquiet);
						} else {
							notifications.push(typeEnum.pit);
							notifications.push(typeEnum.dst);
							notifications.push(typeEnum.sclextents);
						}
						flag = true;
						break;

					case 'yaw':
						/*
						 * Changes to the angular orientation of the section
						 * plane. We are changing the Yaw.
						 */
						requiredObjects = new Array("Max-size",
								"Wlz-distance-range");
						if ($chk(quiet)) {
							notifications.push(typeEnum.yawquiet);
						} else {
							notifications.push(typeEnum.yaw);
							notifications.push(typeEnum.dst);
							notifications.push(typeEnum.sclextents);
						}
						flag = true;
						break;

					case 'rol':
						/*
						 * Changes to the angular orientation of the section
						 * plane. We are changing the Roll.
						 */
						requiredObjects = new Array("Max-size",
								"Wlz-distance-range");
						if ($chk(quiet)) {
							notifications.push(typeEnum.rolquiet);
						} else {
							notifications.push(typeEnum.rol);
							notifications.push(typeEnum.dst);
							notifications.push(typeEnum.sclextents);
						}
						flag = true;
						break;

					case 'x':
					case 'y':
						notifications.push(typeEnum.scroll);
						break;

					default:
						alert("Unknown variable");
					}
				}

				/* Update the tileframe adjustment. */
				this.adjust = findPos("tileframe", "content");

				/* Refresh layer. */
				if (flag)
					ngembryo.layer.refresh();

				if ($defined(requiredObjects)) {
					this.getObjects(requiredObjects, function() {
						this.notify(notifications, trigger);
					}.bind(this), false);
				} else
					this.notify(notifications, trigger);

				if (!quiet && ngembryo.controlReady)
					ngembryo.refresh();
			},

			/**
			 * Putting all of the variable-modifying code in one function allows
			 * us to merge notifications. There might be a better way, but this
			 * works.
			 * 
			 * @param types
			 *            List of parameters that are modified.
			 * @param values
			 *            List of values for each of the parameters.
			 * @param quiet
			 *            Should the changes be visible to the user.
			 * @param trigger
			 *            The handler to send notifications to.
			 */
			setVals : function(types, values, quiet, trigger) {
				/* If there are no triggers, we cannot changes the parameters. */
				if (!$defined(trigger))
					alert("No trigger defined" + types + ", " + values);

				/* These are the parameters that should be handled. */
				var modifiedVariables = new Array();

				/*
				 * Changes to parameters could come in groups. Each one should
				 * be handled one after the other.
				 */
				for ( var i = 0; i < types.length; i++) {
					switch (types[i]) {
					case 'dst':
						var dst = values[i];
						if (dst < this.dst.min)
							dst = this.dst.min;
						else if (dst > this.dst.max)
							dst = this.dst.max;
						this.dst.cur = Math.round(dst);
						modifiedVariables.push('dst');
						break;
					case 'scl':
						var scl = values[i];
						if (scl < this.scl.min)
							scl = this.scl.min;
						else if (scl > this.scl.max)
							scl = this.scl.max;
						scl = Math.pow(2, Math.round(Math.log(scl)
								/ Math.log(2)));
						if (scl == this.scl.cur)
							break;
						this.scl.cur = scl;
						modifiedVariables.push('scl');
						break;

					case 'pit':
						this.pit.cur = values[i];
						modifiedVariables.push('pit');
						break;

					case 'yaw':
						this.yaw.cur = values[i];
						modifiedVariables.push('yaw');
						break;

					case 'rol':
						this.rol.cur = values[i];
						modifiedVariables.push('rol');
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

			setWinMinScl : function() {
				var xmin = this.viewport.width / this.fullImage.width;
				var ymin = this.viewport.height / this.fullImage.height;
				var min = (xmin < ymin) ? xmin : ymin;
				if (this.wlz) {
					this.scl.winmin = Math.pow(2, Math.floor(Math.log(min)
							/ Math.log(2)));
					this.scl.initial = this.scl.winmin;
				} else {
					this.scl.winmin = 0;
					this.scl.initial = Math.pow(2, Math.floor(Math.log(min)
							/ Math.log(2)));
				}
				this.setMinScl();
			},

			setIIPMinScl : function() {
				this.scl.iipmin = Math.pow(2, -this.maxiipres);
				this.setMinScl();
			},

			fixScl : function() {
				if (!$defined(this.scl.cur))
					this.scl.cur = this.scl.initial;
				if (this.scl.cur < this.scl.min)
					this.scl.cur = this.scl.min;
				this.handleSclChange();
			},

			setMinScl : function() {
				this.scl.min = (this.scl.iipmin > this.scl.winmin) ? this.scl.iipmin
						: this.scl.winmin;
				this.scl.min = (this.scl.min < 1) ? this.scl.min : 1;
				this.fixScl();
			},

			handleSclChange : function() {
				this.image.width = this.fullImage.width * this.scl.cur;
				this.image.height = this.fullImage.height * this.scl.cur;
				this.viewable.width = (this.viewport.width < this.image.width) ? this.viewport.width
						: this.image.width;
				this.viewable.height = (this.viewport.height < this.image.height) ? this.viewport.height
						: this.image.height;
				this.xfit = (this.viewport.width > this.image.width)
				this.yfit = (this.viewport.height > this.image.height)
				this.fixROI();
			},

			setViewportSize : function(width, height) {
				var notifications = new Array();
				notifications.push(typeEnum.viewport);
				this.viewport.width = width;
				this.viewport.height = height;
				if ($defined(this.image.width) && $defined(this.image.height)) {
					this.setWinMinScl();
					notifications.push(typeEnum.sclextents);
				}
				this.notify(notifications);
				
				if ($defined(this.scl)) {
					this.setVals(['scl'], [this.scl.cur], true, 'mouse');
				}
			},

			/**
			 * Converts a Woolz scale value to an IIP JTL resolution level
			 * 
			 * @author Tom Perry
			 * 
			 * @param floor
			 *            If true, the integer part of the resulting resolution
			 *            value will be returned. Otherwise, it will be rounded
			 *            to the nearest integer.
			 */
			scl2res : function(scl, floor) {
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
			res2scl : function(res) {
				return Math.pow(2, res - this.maxiipres);
			},

			/**
			 * Nasty set of functions that convert between region-of-interest
			 * (i.e. a value between 0 and 1 expressing the position of the
			 * centre of the viewport) and the position of the top/left edge of
			 * the viewport with respect to the currently displayed image.
			 */
			roi2vpLeft : function() {
				if (this.image.width > this.viewport.width)
					return this.roi.x * this.image.width - this.viewport.width
							/ 2;
				else
					return 0;
			},

			roi2vpTop : function() {
				if (this.image.height > this.viewport.height)
					return this.roi.y * this.image.height
							- this.viewport.height / 2;
				else
					return 0;
			},

			roi2vpLeft2 : function() {
				return this.roi.x * this.image.width - this.viewport.width / 2;
			},

			roi2vpTop2 : function() {
				return this.roi.y * this.image.height - this.viewport.height
						/ 2;
			},

			vpl2roi : function(vp) {
				return (vp + this.viewport.width / 2) / this.image.width;
			},

			vpt2roi : function(vp) {
				return (vp + this.viewport.height / 2) / this.image.height;
			},

			getWlzCoordinate : function(x, y, callback) {
				var url = this.server + "?" + this.fif + "&mod=" + this.mode
						+ "&fxp=" + this.fxp.x + ',' + this.fxp.y + ','
						+ this.fxp.z + "&dst=" + this.dst.cur + "&pit="
						+ this.pit.cur + "&yaw=" + this.yaw.cur + "&rol="
						+ this.rol.cur + "&scl=" + this.scl.cur + "&PRL=0," + x
						+ "," + y + "&OBJ=Wlz-coordinate-3D";
				var response = "";
				new Request( {
					isMetadata : true,
					url : url,
					method : 'get',
					async : true,
					onSuccess : function(transport) {
						if ($defined(transport)) {
							var c = transport.split(":");
							callback(c[1]);
						}
					}.bind(this),
					onFailure : function() {
						alert('Unable to fetch data at "' + url + '"');
					}
				}).send();
				return null;
			}
		});

var TileFrame = new Class(
		{
			initialize : function(source, model) {

				this.source = source;
				this.model = model;
				this.types = [ typeEnum.viewport, typeEnum.scroll,
						typeEnum.scl, typeEnum.dst, typeEnum.pit, typeEnum.yaw,
						typeEnum.rol ];
				model.attach(this, this.types);

				/*
				 * An alternative solution to Ruven Pillay's constrained
				 * dragging problem. Instead of subclassing the MooTools
				 * Drag.Move class, we just create a large div that constrains
				 * the movement of the tile frame.
				 */
				this.tileFrameContainer = new Element('div', {
					id : 'tileframecontainer'
				});
				this.tileFrameContainer.injectInside(this.source);

				this.tileFrame = new Element('div', {
					id : 'tileframe'
				});
				this.tileFrame.injectInside(this.tileFrameContainer);
			},

			destroy : function() {
				this.clearTiles();
				destroyChildSubtree(this.tileFrameContainer);
			},

			handleDrag : function(done, offsetLeft, offsetTop) {
				var x = 0.5;
				var y = 0.5;
				if (!this.model.xfit)
					x = 1
							- (this.model.viewport.width / 2 + offsetLeft + this.tileFrame.offsetLeft)
							/ this.model.image.width;
				if (!this.model.yfit)
					y = 1
							- (this.model.viewport.height / 2 + offsetTop + this.tileFrame.offsetTop)
							/ this.model.image.height;
				this.model.setVals( [ 'x', 'y' ], [ x, y ], !done, 'tileframe');
			},

			update : function(types, trigger) {
				$(this.source).style.width = this.model.viewport.width + "px";
				$(this.source).style.height = this.model.viewport.height + "px";

				if (types.indexOf(typeEnum.scroll) != -1) {
					this.getDraggedTiles();
					if (trigger != 'tileframe')
						this.setTileFramePosition();
				} else {
					this.clearTiles();

					/*
					 * Introducing a delay allows the tileframe to be
					 * repositioned while no tiles are showing, which looks a
					 * lot more neat.
					 */
					setTimeout(function() {
						this.requestImages();
					}.bind(this), 10);

					if ($defined(this.model.image.width)
							&& $defined(this.model.image.height)) {
						if (this.model.xfit)
							this.tileFrameContainer.style.width = this.model.image.width + 'px';
						else
							this.tileFrameContainer.style.width = this.model.image.width
									* 2 - this.model.viewport.width + 'px';
						if (this.model.yfit)
							this.tileFrameContainer.style.height = this.model.image.height + 'px';
						else
							this.tileFrameContainer.style.height = this.model.image.height
									* 2 - this.model.viewport.height + 'px';

						this.tileFrame.style.width = this.model.image.width
								+ "px";
						this.tileFrame.style.height = this.model.image.height
								+ "px";
						this.setTileFramePosition();
					}
				}
			},

			setTileFramePosition : function() {
				if (this.model.xfit) {
					this.tileFrameContainer.style.left = (this.model.viewport.width - this.model.image.width) / 2 + 'px';
					this.tileFrame.style.left = 0 + "px";
				} else {
					this.tileFrameContainer.style.left = this.model.viewport.width
							- this.model.image.width + 'px';
					this.tileFrame.style.left = -this.model.roi2vpLeft()
							+ this.model.image.width
							- this.model.viewport.width + "px";
				}
				if (this.model.yfit) {
					this.tileFrameContainer.style.top = (this.model.viewport.height - this.model.image.height) / 2 + 'px';
					this.tileFrame.style.top = 0 + "px";
				} else {
					this.tileFrameContainer.style.top = this.model.viewport.height
							- this.model.image.height + 'px';
					this.tileFrame.style.top = -this.model.roi2vpTop()
							+ this.model.image.height
							- this.model.viewport.height + "px";
				}
			},

			/**
			 * Gets the initial images for the view.
			 * 
			 * @author Ruven Pillay, Tom Perry
			 */
			requestImages : function() {
				if (!(this.model.scl.cur >= this.model.scl.min && this.model.scl.cur <= this.model.scl.max)) {
					alert("Error: cannot request image with scale "
							+ this.model.scl.cur + "\n" + "Minimum scale: "
							+ this.model.scl.min + ", Maximum scale: "
							+ this.model.scl.max);
					return;
				}
				var hiddenBorder = 1;

				this.res = Math.round(this.model.maxiipres
						+ Math.log(this.model.scl.cur) / Math.log(2));

				this.startx = Math.floor(this.model.roi2vpLeft()
						/ this.model.tileSize.width)
						- hiddenBorder;
				this.starty = Math.floor(this.model.roi2vpTop()
						/ this.model.tileSize.height)
						- hiddenBorder;
				this.endx = Math
						.floor((this.model.roi2vpLeft() + this.model.viewable.width)
								/ this.model.tileSize.width)
						+ hiddenBorder;
				this.endy = Math
						.floor((this.model.roi2vpTop() + this.model.viewable.height)
								/ this.model.tileSize.height)
						+ hiddenBorder;
				var refresh = false;
				this.xtiles = Math.ceil(this.model.image.width
						/ this.model.tileSize.width);
				this.ytiles = Math.ceil(this.model.image.height
						/ this.model.tileSize.height);
				this.getTiles(this.startx, this.endx, this.starty, this.endy);
				if ($chk(this.model.hasOverlays))
					this.overlay.requestMaps();
			},

			/**
			 * Delete our old image mosaic
			 * 
			 * @author Ruven Pillay
			 */
			clearTiles : function(scl, dst) {
				var tileClass = 's' + scl + 'd' + dst;
				$('tileframe').getChildren().each(function(el) {
					if (!el.hasClass(tileClass))
						el.dispose();
				});
			},

			/**
			 * If we're requesting a Woolz image, we need to specify additional
			 * parameters
			 * 
			 * @author Tom Perry
			 */
			getTileSrc : function(k) {
				var src;
				if (this.model.wlz) {
					src = this.model.server + "?" + this.model.fif + "&mod="
							+ this.model.mode + "&fxp=" + this.model.fxp.x
							+ ',' + this.model.fxp.y + ',' + this.model.fxp.z
							+ "&scl=" + this.model.scl.cur + "&dst="
							+ this.model.dst.cur * this.model.scl.cur + "&pit="
							+ this.model.pit.cur + "&yaw=" + this.model.yaw.cur
							+ "&rol=" + this.model.rol.cur + "&qlt="
							+ this.model.qlt.cur + "&jtl=0," + k;
				} else {
					src = this.model.server + "?" + this.model.fif + "&qlt="
							+ this.model.qlt.cur + "&jtl=" + this.res + "," + k;
				}
				return src;
			},

			/**
			 * Creates an <img> element, sets its src according to the arguments
			 * given, sets its absolute position, and other useful stuff. See
			 * requestImages() for a function that creates all starting tiles
			 * appropriately
			 * 
			 * @author Tom Perry
			 */
			getTile : function(i, j) {
				if (i < 0 || i >= this.xtiles || j < 0 || j >= this.ytiles)
					return;
				var k = i + (j * this.xtiles);
				var src = this.getTileSrc(k);
				var tileId = 'x' + i + 'y' + j;
				var tileClass = 's' + this.model.scl.cur + 'd'
						+ this.model.dst.cur;
				new Element('img', {
					'id' : tileId,
					'src' : src,
					'class' : 'tile' + ' ' + tileClass,
					'useMap' : '#components_' + tileId,
					'styles' : {
						'left' : i * this.model.tileSize.width,
						'top' : j * this.model.tileSize.height
					}
				}).injectInside('tileframe');
			},

			/**
			 * Deletes an <img> element. See clearTiles() for a tile frame
			 * clearing function.
			 * 
			 * @author Tom Perry
			 */
			removeTile : function(i, j) {

				var tileId = 'x' + i + 'y' + j;
				var tile = document.getElementById(tileId);
				if (tile)
					tile.dispose();
			},

			getTiles : function(sx, ex, sy, ey) {

				for ( var j = 0; j <= ey - sy; j++)
					for ( var i = 0; i <= ex - sx; i++)
						this.getTile(i + sx, j + sy);
			},

			removeTiles : function(sx, ex, sy, ey) {

				for ( var j = 0; j <= ey - sy; j++)
					for ( var i = 0; i <= ex - sx; i++)
						this.removeTile(i + sx, +sy);
			},

			/**
			 * Refresh function to avoid the problem of tiles not loading
			 * properly in Firefox/Mozilla
			 * 
			 * @author Ruven Pillay
			 */
			refresh : function() {
				var unloaded = 0;
				$('tileframe').getChildren().each(function(el) {
					if (el.width == 0 || el.height == 0) {
						el.src = el.src;
						unloaded = 1;
					}
				});
				if (unloaded == 0) {
					$clear(this.refresher);
					this.refresher = null;
					$('tileframe').style.cursor = 'move';
				}
			},

			/**
			 * Load new tiles, remove old ones
			 * 
			 * @author Tom Perry
			 */
			getDraggedTiles : function() {
				if (!this.model.xfit) {
					while (this.model.roi2vpLeft() + this.model.viewport.width > (this.endx + 1)
							* this.model.tileSize.width) {
						this.getTiles(this.endx + 1, this.endx + 1,
								this.starty, this.endy);
						this.removeTiles(this.startx, this.startx, this.starty,
								this.endy);
						this.startx++;
						this.endx++;
					}
					while (this.model.roi2vpLeft() < this.startx
							* this.model.tileSize.width) {
						this.getTiles(this.startx - 1, this.startx - 1,
								this.starty, this.endy);
						this.removeTiles(this.endx, this.endx, this.starty,
								this.endy);
						this.startx--;
						this.endx--;
					}
				}

				if (!this.model.yfit) {
					while (this.model.roi2vpTop() + this.model.viewport.height > (this.endy + 1)
							* this.model.tileSize.height) {
						this.getTiles(this.startx, this.endx, this.endy + 1,
								this.endy + 1);
						this.removeTiles(this.startx, this.endx, this.starty,
								this.starty);
						this.starty++;
						this.endy++;
					}
					while (this.model.roi2vpTop() < this.starty
							* this.model.tileSize.height) {
						this.getTiles(this.startx, this.endx, this.starty - 1,
								this.starty - 1);
						this.removeTiles(this.startx, this.endx, this.endy,
								this.endy);
						this.starty--;
						this.endy--;
					}
				}

			}

		});

/**
 * Modified from the one written by Tom Perry.
 */
var DraggableWindow = new Class( {
	initialize : function(source, title, model) {
		this.title = title.toLowerCase().split(" ").join("");
		this.prevEventOver = true;
		this.model = model;
		model.attach(this, [ typeEnum.viewport ]);
		this.container = new Element('div', {
			'id' : this.title + '-container',
			'class' : 'draggable-container'
		});
		this.container.injectInside(source);
		this.container.style.display = 'none';
		this.handle = new Element('div', {
			'id' : this.title + '-handle',
			'class' : 'draggable-handle'
		});
		this.handle.injectInside(this.container);
		this.container.makeDraggable(getDragOpts(null, 0, this,
				this.title + '-handle'));
		this.win = new Element('div', {
			'id' : this.title + '-win',
			'class' : 'draggable-win'
		});
		this.win.injectInside(this.container);
	},

	destroy : function() {
		destroyChildSubtree(this.container);
	},

	handleDrag : function(done) {
		var x = this.container.offsetLeft;
		if (x + this.width / 2 >= this.model.viewport.width / 2)
			x += (this.width - this.model.viewport.width);
		var y = this.container.offsetTop;
		if (y + this.height / 2 >= this.model.viewport.height / 2)
			y += (this.height - this.model.viewport.height);
		this.setPosition(x, y);
	},

	update : function(types) {
		this.applyPosition();
	},

	setVisible : function(visible) {
		if (visible)
			this.container.style.display = 'block';
		else
			this.container.style.display = 'none';
	},

	setPosition : function(x, y) {
		this.x = x;
		this.y = y;
	},

	applyPosition : function() {
		if (this.x >= 0)
			this.container.style.left = this.x + 'px';
		else if (this.x < 0)
			this.container.style.left = this.model.viewport.width - this.width
					+ this.x + 'px';
		if (this.y >= 0)
			this.container.style.top = this.y + 'px';
		else if (this.y < 0)
			this.container.style.top = this.model.viewport.height - this.height
					+ this.y + 'px';
	},

	setDimensions : function(wid, hei) {
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

var VarWin = new Class( {
	initialize : function(source, model) {
		this.model = model;
		model.attach(this, [ typeEnum.viewport, typeEnum.scroll, typeEnum.scl,
				typeEnum.dst, typeEnum.dstquiet, typeEnum.pit, typeEnum.yaw,
				typeEnum.rol ]);
		this.window = new DraggableWindow(source, 'varwin', model);
		this.window.setDimensions(200, 200);
	},

	update : function(types) {
		this.window.setVisible(true);
		var foo = 100;
		this.window.win.innerHTML = "<table width='200px'>"
				+ "<tr><td>    </td><td>cur</td><td>min</td><td>max</td></tr>"
				+ "<tr><td>scl:</td><td>"
				+ Math.round(this.model.scl.cur * foo) / foo
				+ "</td><td>"
				+ Math.round(this.model.scl.min * foo) / foo
				+ "</td><td>"
				+ Math.round(this.model.scl.max * foo) / foo
				+ "</td></tr>"
				+ "<tr><td>dst:</td><td>"
				+ Math.round(this.model.dst.cur * foo) / foo
				+ "</td><td>"
				+ Math.round(this.model.dst.min * foo) / foo
				+ "</td><td>"
				+ Math.round(this.model.dst.max * foo) / foo
				+ "</td></tr>"
				+ "<tr><td>pit:</td><td>"
				+ Math.round(this.model.pit.cur * foo) / foo
				+ "</td><td>"
				+ Math.round(this.model.pit.min * foo) / foo
				+ "</td><td>"
				+ Math.round(this.model.pit.max * foo) / foo
				+ "</td></tr>"
				+ "<tr><td>yaw:</td><td>"
				+ Math.round(this.model.yaw.cur * foo)
				/ foo
				+ "</td><td>"
				+ Math.round(this.model.yaw.min * foo)
				/ foo
				+ "</td><td>"
				+ Math.round(this.model.yaw.max * foo)
				/ foo
				+ "</td></tr>"
				+ "<tr><td>rol:</td><td>"
				+ Math.round(this.model.rol.cur * foo)
				/ foo
				+ "</td><td>"
				+ Math.round(this.model.rol.min * foo)
				/ foo
				+ "</td><td>"
				+ Math.round(this.model.rol.max * foo)
				/ foo
				+ "</td></tr>"
				+ "</table>"
				+ "<p>fxp: "
				+ Math.round(this.model.fxp.x * foo)
				/ foo
				+ ","
				+ Math.round(this.model.fxp.y * foo)
				/ foo
				+ ","
				+ Math.round(this.model.fxp.z * foo) / foo + "</p>"
	}

});

var Locator = new Class(
		{
			initialize : function(source, server, model) {
				this.maxWidth = dojo.style("roiControl", "width");
				this.maxHeight = dojo.style("roiControl", "height");
				this.server = server;
				this.model = model;
				model.attach(this, [ typeEnum.viewport, typeEnum.scroll,
						typeEnum.scl, typeEnum.dst, typeEnum.dstquiet,
						typeEnum.pit, typeEnum.pitquiet, typeEnum.yaw,
						typeEnum.yawquiet, typeEnum.rol ]);
				this.zoneBorder = 1;
				var title = "Locator";
				this.title = title.toLowerCase().split(" ").join("");
				this.imageContainer = new Element('div', {
					'id' : this.title + '-imagecontainer',
					'class' : 'imagecontainer'
				});
				this.imageContainer.injectInside(source);
				this.image = new Element('img', {
					'id' : this.title + '-image'
				});
				this.image.injectInside(this.imageContainer);
				this.zone = new Element('div', {
					'id' : this.title + '-zone',
					'class' : 'zone',
					'styles' : {
						'border' : this.zoneBorder + 'px solid yellow'
					}
				});
				this.zone.injectInside(this.imageContainer);
				this.zoneDraggable = this.zone.makeDraggable(getDragOpts(
						this.title + '-imagecontainer', 0, this));
			},

			destroy : function() {
				if ($defined(this.zoneDraggable)) {
					this.zoneDraggable.detach();
				}
				destroyChildSubtree(this.imageContainer);
			},

			moveZone : function(done, dx, dy) {
				var x = 0.5;
				var y = 0.5;
				if (!this.model.xfit) {
					var t = this.zone.offsetLeft + dx;
					if (t < 0)
						t = 0;
					else {
						var j = this.navwidth - this.zonewidth;
						if (t > j)
							t = j;
					}
					x = (t + this.zonewidth / 2) / this.navwidth;
					this.zone.style.left = t + "px";
				}
				if (!this.model.yfit) {
					var t = this.zone.offsetTop + dy;
					if (t < 0)
						t = 0;
					else {
						var j = this.navheight - this.zoneheight;
						if (t > j)
							t = j;
					}
					y = (t + this.zoneheight / 2) / this.navheight;
					this.zone.style.top = t + "px";
				}
				this.model.setVals( [ 'x', 'y' ], [ x, y ], !done, 'locator');
			},

			handleDrag : function(done) {
				var x = 0.5;
				var y = 0.5;

				/*
				 * Zone is the highlighted area inside the region of interest
				 * (Locator) panel window. The value of this.zone.offsetLeft and
				 * this.zone.offsetTop changes when the user drags the zone.
				 * Since we want to use navigator buttons, we only need to
				 * update these variables one of the four buttons are pressed.
				 */
				if (!this.model.xfit)
					x = (this.zone.offsetLeft + this.zonewidth / 2)
							/ this.navwidth;
				if (!this.model.yfit)
					y = (this.zone.offsetTop + this.zoneheight / 2)
							/ this.navheight;
				this.model.setVals( [ 'x', 'y' ], [ x, y ], !done, 'locator');
			},

			update : function(types, trigger) {
				var flag = false;
				if (types.indexOf(typeEnum.scl) != -1
						|| types.indexOf(typeEnum.dst) != -1
						|| types.indexOf(typeEnum.dstquiet) != -1
						|| types.indexOf(typeEnum.pit) != -1
						|| types.indexOf(typeEnum.yaw) != -1
						|| types.indexOf(typeEnum.rol) != -1
						|| types.indexOf(typeEnum.all) != -1) {
					var w = this.maxWidth / this.model.fullImage.width;
					var h = this.maxHeight / this.model.fullImage.height;
					this.navscale = (w < h) ? w : h;
					this.navwidth = (this.navscale * this.model.fullImage.width);
					this.navheight = (this.navscale * this.model.fullImage.height);
					if (this.model.wlz) {
						var navsrc = this.server + '?' + this.model.fif
								+ "&mod=" + this.model.mode + "&fxp="
								+ this.model.fxp.x + ',' + this.model.fxp.y
								+ ',' + this.model.fxp.z + "&scl="
								+ this.navscale + "&dst="
								+ this.model.dst.cur * this.navscale + "&pit="
								+ this.model.pit.cur + "&yaw="
								+ this.model.yaw.cur + "&rol="
								+ this.model.rol.cur + "&qlt="
								+ this.model.qlt.cur + '&cvt=jpeg';
					} else {
						var navsrc = this.server + '?' + this.model.fif
								+ '&wid=' + this.navwidth * 2 + '&qlt='
								+ this.model.qlt.cur + '&cvt=jpeg';

						this.image.style.width = this.navwidth + 'px';
						this.image.style.height = this.navheight + 'px';
						this.imageContainer.style.width = this.navwidth + 'px';
						this.imageContainer.style.height = this.navheight + 'px';
					}
					this.imageContainer.style.left = Math
							.round((this.maxWidth - this.navwidth) / 2) + 'px';
					this.imageContainer.style.top = Math
							.round((this.maxHeight - this.navheight) / 2) + 'px';
					this.image.src = navsrc;
					flag = true;
				}
				if (flag || types.indexOf(typeEnum.viewport) != -1) {
					this.zonewidth = this.navscale * this.model.viewable.width
							/ this.model.scl.cur;
					this.zoneheight = this.navscale
							* this.model.viewable.height / this.model.scl.cur;
					if ($chk(this.zonewidth))
						this.zone.style.width = this.zonewidth - 2
								* this.zoneBorder + 'px';
					if ($chk(this.zoneheight))
						this.zone.style.height = this.zoneheight - 2
								* this.zoneBorder + 'px';
				}
				if (flag || types.indexOf(typeEnum.scroll) != -1) {
					if (trigger != 'locator') {
						var x = this.model.roi.x * this.navwidth
								- this.zonewidth / 2;
						var y = this.model.roi.y * this.navheight
								- this.zoneheight / 2;
						if ($chk(x))
							this.zone.style.left = x + 'px';
						if ($chk(y))
							this.zone.style.top = y + 'px';
					}
				}
			}
		});

var SectionPlane = new Class( {
	Implements : Options,
	initialize : function(source, server, model, options) {
		this.server = server;
		this.model = model;
		model.attach(this, [ typeEnum.pit, typeEnum.pitquiet,
				typeEnum.yawquiet, typeEnum.yaw ]);
		this.setOptions(options);
		this.width = dojo.style(source, "width");
		this.height = dojo.style(source, "height");
		this.textheight = 32;
		this.shorttitle = this.options.title.toLowerCase().split(" ").join("");
		this.window = new DraggableWindow(source, this.options.title, model);
		this.window.setDimensions(this.width, this.height);
		this.window.win.style.background = this.options.bgcolor;
		this.image = new Element('img', {
			'id' : this.shorttitle + '-image',
			'class' : 'sectionplane-image',
			'styles' : {
				'cursor' : 'move',
				'left' : '0px',
				'top' : '0px',
				'width' : 128,
				'height' : 128
			}
		});
		this.image.injectInside(this.window.win);
		this.drag = new Drag(this.shorttitle + '-image', getDragOpts(null, 10,
				this));
	},

	handleDrag : function(done) {
		var pit = parseInt(this.image.style.top);
		var yaw = -parseInt(this.image.style.left);
		pit = Math.round(pit / this.options.inc) * this.options.inc;
		pit = ((pit % this.model.pit.max) + this.model.pit.max)
				% this.model.pit.max;
		yaw = Math.round(yaw / this.options.inc) * this.options.inc;
		yaw = ((yaw % this.model.yaw.max) + this.model.yaw.max)
				% this.model.yaw.max;

		/*
		 * Since the dragging is in two dimensions, the value of roll cannot be
		 * set by dragging.
		 */
		this.model.setVals( [ 'pit', 'yaw' ], [ pit, yaw ], !done,
				'sectionplane');

		/*
		 * Remember, we have to break the bi-directional event loop with the
		 * sliders.
		 */
		ngembryo.setByUser = false;
		ngembryo.pitchSlider.set(this.model.pit.cur);
		ngembryo.yawSlider.set(this.model.yaw.cur);
		ngembryo.setByUser = true;
	},

	update : function(types, trigger) {
		if (!this.model.wlz)
			return;
		this.window.setVisible(true);
		var k = Math.round(this.model.pit.cur * this.options.numpit
				/ this.model.pit.max)
				* this.options.numyaw
				+ Math.round(this.model.yaw.cur * this.options.numyaw
						/ this.model.yaw.max);
		var src = this.server + "?fif=" + this.options.src + "&jtl=0," + k;
		this.image.src = src;
	},

	destroy : function() {
		this.drag.detach();
	}
});
