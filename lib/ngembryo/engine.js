/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh
 * Funded by the JISC (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */
/**
 * @classDescription This class encapsulates an annotation rendering engine.
 * 
 * The annotation engine is the heart of the annotation management system. It
 * controls the retrieval, display and update of annotations, by establishing
 * communication with the annotation server.
 */
var AnnotationEngine = new Class(
		{
			initialize : function(target) {
				/* Unique DOM ID of the target frame div. */
				this.target = target;
				/* DOM element where the Dojo surface is created. */
				this.parent = null;
				/* Dimension of the target frame (this.parent). */
				this.dim = null;
				/* Initialise cookie manager. */
				this.cookieManager = new CookieManager();
				/**
				 * TODO: Could put all of this as a JSON string. Then we will
				 * have to call dojo.cookie() only once.
				 */
				/* If true, displays controls. */
				this.controlsOn = this.cookieManager.get("controlsOn", true);
				/* If true, controls are usable. */
				this.controlsActive = this.cookieManager.get("controlsActive",
						true);
				/* If true, displays 2D markers. */
				this.m2DV = this.cookieManager.get("m2dv", true);
				/* If true, displays 3D markers. */
				this.m3DV = this.cookieManager.get("m3dv", true);
				/* If true, displays 2D regions. */
				this.r2DV = this.cookieManager.get("r2dv", true);
				this.cc = false; /* If true, display create canvas. */
				this.ccType = 1; /* Type of annotation to be created. */
				this.ccTypeEnum = {
					c2dm : 1,
					c2dr : 2,
					mesr : 3
				}; /* Enumeration of accepted annotation types. */
				this.ccHandler = null; /* Handles annotation creation. */
				this.eventCanvas = []; /* Canvas event handlers. */
				this.eventLastPoint = []; /* Polyline completion event. */
				this.surface = null; /* Dojo surface for drawing annotations. */
				this.layers = null; /* Manages the annotation layers. */
				this.icons = null; /* Manages the marker icons. */
				this.labels = null; /* For rendering labels properly. */
				this.regionPoints = new Array(); /* For creating polyline. */
				/* Holds polyline coordinates relative to tileframe. */
				this.tempRegionPoints = new Array();
				this.circumference = 0; /* TODO: Circumference of polygon. */
				this.actual3Dcoord = null; /* TODO: Actual 3D coordinates. */
			},

			start : function() {
				if ($defined(this.target)) {
					/* Targetframe DOM element for Dojo surface creation. */
					this.parent = dojo.byId(this.target);
					/* Get dimension of the target frame DOM element. */
					this.dim = dojo.coords(this.parent);
					/* Create a dojo surface using the target DOM element. */
					this.surface = this.createSurface();
					this.labelRenderer = new LabelRenderer("Arial", "normal",
							"bold", "9pt", "black", null, "#FFF0B8", null, 0,
							10, 50, 50, true);
					this.layerManager = new LayerManager(this.labelRenderer);
					this.iconManager = new IconManager();

					/* Register the icons. */
					this.iconManager.registerIcon('default', new Icon(
							'resources/images/bookmark.png', 16, 16, 'cc'));
					this.iconManager.registerIcon('bookmark', new Icon(
							'resources/images/Marker2D.png', 16, 16, 'dd'));
					this.iconManager.registerIcon('filefind', new Icon(
							'resources/images/filefind.png', 16, 16, 'cc'));
					this.iconManager.registerIcon('activity', new Icon(
							'resources/images/activity.png', 16, 16, 'cc'));

					/**
					 * TODO:For the moment, we have no ordering of layers. So,
					 * the last layer added will be displayed on the top.
					 */
					this.layerManager.addLayer('2Dregions', true);
					this.layerManager.addLayer('2Dmarkers', true);
				} else {
					console.error("Undefined target DOM element.")
				}
			},

			destroy : function() {
				this.layerManager.destroy();
				this.iconManager.destroy();
				this.surface.clear();
			},

			/**
			 * Refreshes the screen and draw with current settings.
			 * 
			 * With every refresh invocation, the engine communicated with the
			 * annotation server to retrieve the latest annotations. This is
			 * done using Dojo.xhr.
			 */
			refresh : function() {
				if (woolz && woolz.locator) {
					woolz.refresh();

				if ($defined(this.surface)) {
					/* Calculate the visible bounding box for retrieving annotations. */
					var x_low = -woolz.model.adjust[0];
					x_low = x_low < 0 ? 0 : x_low;
					var x_high = x_low + woolz.model.viewable.width;
					var y_low = -woolz.model.adjust[1];
					y_low = y_low < 0 ? 0 : y_low;
					var y_high = y_low + woolz.model.viewable.height;									

					if (this.m2DV && $defined(ngembryo.layer)) {
						this.layerManager.emptyLayer("2Dmarkers");
						if ($defined(ngembryo.layer.items)) {
							for ( var i = 0; i < ngembryo.layer.items.length; i++) {
								if (ngembryo.layer.items[i].visible) {
									this.get2DMarkers(
											ngembryo.layer.items[i].id, x_low, y_low,
											x_high, y_high, woolz.model.scl.cur, woolz.model.scl.cur);
								}
							}
						}
					}

					if (this.r2DV && $defined(ngembryo.layer)) {
						this.layerManager.emptyLayer("2Dregions");
						if ($defined(ngembryo.layer.items)) {
							for ( var i = 0; i < ngembryo.layer.items.length; i++) {
								if (ngembryo.layer.items[i].visible) {
									this.get2DRegions(
											ngembryo.layer.items[i].id, x_low, y_low,
											x_high, y_high, woolz.model.scl.cur, woolz.model.scl.cur);
								}
							}
						}
					}

					this.surface.clear();
					this.layerManager.displayVisibleLayers(this.surface);

					if (this.cc == true) {
						switch (this.ccType) {
						case this.ccTypeEnum.c2dm:
							this.activateCreateCanvas2DMarker();
							break;
						case this.ccTypeEnum.c2dr:
							this.activateCreateCanvas2DRegion();
							break;
						case this.ccTypeEnum.mesr:
							this.activateMeasurementCanvas();
							break;
						}
					}
				} else {
					console.error("Dojo surface is undefined.");
				}
				}
			},

			/**
			 * Checks if the controls is active.
			 */
			isControlsActive : function() {
				return this.controlsActive;
			},

			/**
			 * Activates the control.
			 */
			activateControls : function() {
				this.controlsActive = true;
				this.cookieManager.set("controlsActive", this.controlsActive);
			},

			/**
			 * Deactivates the control
			 */
			deactivateControls : function() {
				this.controlsActive = false;
				this.cookieManager.set("controlsActive", this.controlsActive);
			},

			/**
			 * Checks if the controls should be displayed.
			 */
			isControlsVisible : function() {
				return this.controlsOn;
			},

			/**
			 * Display controls.
			 */
			showControls : function() {
				this.controlsOn = true;
				dojo.style("controls", "visibility", "visible");
				this.cookieManager.set("controlsOn", this.controlsOn);
			},

			/**
			 * Hides controls.
			 */
			hideControls : function() {
				this.controlsOn = false;
				dojo.style("controls", "visibility", "hidden");
				this.cookieManager.set("controlsOn", this.controlsOn);
			},

			/**
			 * Toggles control display.
			 */
			toggleControlsVisibility : function() {
				this.controlsOn = !this.controlsOn;
				this.cookieManager.set("controlsOn", this.controlsOn);
			},

			/**
			 * Checks if 2D markers should be displayed.
			 */
			isMarker2DVisible : function() {
				return this.m2DV;
			},

			/**
			 * Displays 2D markers.
			 */
			showMarker2D : function() {
				this.m2DV = true;
				this.cookieManager.set("m2dv", this.m2DV);
				this.refresh();
			},

			/**
			 * Hides 2D markers.
			 */
			hideMarker2D : function() {
				this.m2DV = false;
				this.cookieManager.set("m2dv", this.m2DV);
				this.refresh();
			},

			/**
			 * Toggles display of 2D markers.
			 */
			toggleMarker2DVisibility : function() {
				this.m2DV = !this.m2DV;
				this.cookieManager.set("m2dv", this.m2DV);
				this.refresh();
			},

			/**
			 * Checks if 3D markers should be dislayed.
			 */
			isMarker3DVisible : function() {
				return this.m3DV;
			},

			/**
			 * Displays 3D markers.
			 */
			showMarker3D : function() {
				this.m3DV = true;
				this.cookieManager.set("m3dv", this.m3DV);
			},

			/**
			 * Hides 3D markers.
			 */
			hideMarker3D : function() {
				this.m3DV = false;
				this.cookieManager.set("m3dv", this.m3DV);
			},

			/**
			 * Toggles display of 3D markers.
			 */
			toggleMarker3DVisibility : function() {
				this.m3DV = !this.m3DV;
				this.cookieManager.set("m3dv", this.m3DV);
				this.refresh();
			},

			/**
			 * Checks if 2D regions should be displayed.
			 */
			isRegion2DVisible : function() {
				return this.r2DV;
			},

			/**
			 * Displays 2D regions.
			 */
			showRegion2D : function() {
				this.r2DV = true;
				this.cookieManager.set("r2dv", this.r2DV);
			},

			/**
			 * Hides 2D regions.
			 */
			hideRegion2D : function() {
				this.r2DV = false;
				this.cookieManager.set("r2dv", this.r2DV);
			},

			/**
			 * Toggles display of 2D regions.
			 */
			toggleRegion2DVisibility : function() {
				this.r2DV = !this.r2DV;
				this.cookieManager.set("r2dv", this.r2DV);
				this.refresh();
			},

			/**
			 * Displays the create canvas.
			 */
			showCreateCanvas : function(type) {
				if (ngembryo.layer.checkLayer()) {
					this.cc = true;
					this.ccType = type;
					this.detachDraggingEvent();
					this.detachScrollEvent();
					dojo.style("controls", {
						display : "none"
					});
					switch (this.ccType) {
					case this.ccTypeEnum.c2dm:
						ngembryo.toolbar.disable("create2DMarker");
						break;
					case this.ccTypeEnum.c2dr:
						ngembryo.toolbar.disable("create2DRegion");
						break;
					case this.ccTypeEnum.mesr:
						ngembryo.toolbar.disable("takeMeasurement");
						break;
					}
					this.refresh();
					return true;
				} else {
					return false;
				}
			},

			/**
			 * Hides the create canvas.
			 */
			hideCreateCanvas : function() {
				this.cc = false;
				dojo.forEach(this.eventCanvas, dojo.disconnect);
				this.eventCanvas = [];
				this.attachScrollEvent();
				this.attachDraggingEvent();
				dojo.style("controls", {
					display : "block"
				});
				switch (this.ccType) {
				case this.ccTypeEnum.c2dm:
					ngembryo.toolbar.enable("create2DMarker");
					break;
				case this.ccTypeEnum.c2dr:
					ngembryo.toolbar.enable("create2DRegion");
					break;
				case this.ccTypeEnum.mesr:
					ngembryo.toolbar.enable("takeMeasurement");
					break;
				}
				this.refresh();
			},

			/**
			 * Toggles display of the create canvas.
			 */
			toggleCreateCanvasVisibility : function() {
				this.cc = !this.cc;
				this.refresh();
			},

			/**
			 * Returns true if the create canvas is active.
			 */
			isCreateCanvasVisible : function() {
				return this.cc;
			},

			/**
			 * Sets the type of annotation to be created using the create
			 * canvas.
			 * 
			 * @param {Integer}
			 *            type
			 */
			setCreateCanvasType : function(type) {
				this.ccType = type;
			},

			/**
			 * Creates a Dojo surface using the target DOM element.
			 * 
			 * The Dojo surface, if successfully created, is used as a canvas
			 * for drawing all of the annotation (by invoking the draw() method,
			 * 
			 * @see Annotation).
			 */
			createSurface : function() {
				var surface = null;
				if ($defined(this.parent)) {
					surface = dojox.gfx.createSurface(this.parent, this.dim.w,
							this.dim.h);
				} else {
					console
							.error("Failed to create Dojo surface: Target canvas '"
									+ this.target + "' is not a DOM element.");
				}
				return surface;
			},

			/**
			 * Makes dragging events on the Dojo surface available to the embryo
			 * model. Used for changing the region of interest.
			 */
			attachDraggingEvent : function() {
				return;
				var surfaceNode = ngembryo.engine.surface.getEventSource();
				// var surfaceNode = dojo.byId("tileframe");
				dojo.style(surfaceNode, "cursor", "-moz-grab");
				var handleDragStart = function(event) {
					ngembryo.engine.dragStartX = event.clientX;
					ngembryo.engine.dragStartY = event.clientY;
					var xratio = woolz.locator.navwidth / window.getWidth();
					var yratio = woolz.locator.navheight / window.getHeight();
					dojo.style(surfaceNode, "cursor", "-moz-grabbing");
					ngembryo.engine.draggableDrag = dojo.connect(surfaceNode,
							"onmousemove", function(event) {
								var dx = ngembryo.engine.dragStartX
										- event.clientX;
								var dy = ngembryo.engine.dragStartY
										- event.clientY;
								ngembryo.engine.dragStartX = event.clientX;
								ngembryo.engine.dragStartY = event.clientY;
								dx = Math.round(dx * xratio);
								dy = Math.round(dy * yratio);
								woolz.locator.moveZone(false, dx, dy);
							});
					ngembryo.engine.draggableStop = dojo.connect(surfaceNode,
							"onmouseup", function(event) {
								var dx = ngembryo.engine.dragStartX
										- event.clientX;
								var dy = ngembryo.engine.dragStartY
										- event.clientY;
								dojo.style(surfaceNode, "cursor", "-moz-grab");
								dojo.disconnect(ngembryo.engine.draggableDrag);
								dojo.disconnect(ngembryo.engine.draggableStop);
								dx = Math.round(dx * xratio);
								dy = Math.round(dy * yratio);
								woolz.locator.moveZone(true, dx, dy);
								ngembryo.refresh();
							});
				};
				this.draggableStart = dojo.connect(surfaceNode, "onmousedown",
						handleDragStart);
			},

			/**
			 * Removes dragging events from the Dojo surface.
			 */
			detachDraggingEvent : function() {
				return;
				if ($defined(this.draggableStart)) {
					dojo.disconnect(ngembryo.engine.draggableStart);
					var surfaceNode = ngembryo.engine.surface.getEventSource();
					// var surfaceNode = dojo.byId("tileframe");
					dojo.style(surfaceNode, "cursor", "pointer");
				}
			},

			/**
			 * Makes scroll events on the Dojo surface available to the embryo
			 * model. Used for zooming.
			 */
			attachScrollEvent : function() {
				return;
				// this.scrolling = dojo.connect(dojo.byId("tileframe"),
				// (!dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll"),
				// function(e){
				this.scrolling = dojo.connect(ngembryo.engine.surface
						.getEventSource(), (!dojo.isMozilla ? "onmousewheel"
						: "DOMMouseScroll"), function(e) {
					var scroll = e[(!dojo.isMozilla ? "wheelDelta" : "detail")]
							* (!dojo.isMozilla ? 1 : -1);
					ngembryo.controlManager.setZoomValue(scroll);
					ngembryo.refresh();
				});
			},

			/**
			 * Removes scroll events from the Dojo surface.
			 */
			detachScrollEvent : function() {
				return;
				if ($defined(this.scrolling)) {
					// dojo.disconnect(dojo.byId("tileframe"), (!dojo.isMozilla
					// ? "onmousewheel" : "DOMMouseScroll"));
					dojo.disconnect(ngembryo.engine.surface.getEventSource(),
							(!dojo.isMozilla ? "onmousewheel"
									: "DOMMouseScroll"));
				}
			},

			/**
			 * Retrieves 2D markers from the annotation server.
			 * 
			 * This method uses Dojo.xhr Ajax interface for retrieving 2D marker
			 * annotations which falls inside a 2D bounding box. The bounding
			 * box is specified by its top-left (xl, yl) and bottom-right (xh,
			 * yh) coordinates. We assume that the origin is at the top-left
			 * corner of the Dojo surface.
			 * 
			 * @param {Integer}
			 *            lid Unique ID of parent layer for the markers.
			 * @param {Integer}
			 *            xl x-coordinate of top-left corner.
			 * @param {Integer}
			 *            yl y-coordinate of top-left corner.
			 * @param {Integer}
			 *            xh x-coordinate of bottom-right corner.
			 * @param {Integer}
			 *            yh y-coordinate of bottom-right corner.
			 * @param {Integer}
			 *            sl Lowest scale to include.
			 * @param {Integer}
			 *            sh Highest scale to include.
			 */
			get2DMarkers : function(lid, xl, yl, xh, yh, sl, sh) {
				var func = this.__update2DMarkers;
				var layerManager = this.layerManager;
				var iconManager = this.iconManager;
				dojo.xhrGet( {
					url : "get2DMarkers.php?lid=" + lid + "&x_low=" + xl
							+ "&x_high=" + xh + "&y_low=" + yl + "&y_high="
							+ yh + "&scale_low=" + sl + "&scale_high=" + sh
							+ "&format=json",
					handleAs : "json",
					timeout : 5000, /* Time in milliseconds. */
					sync : true,
					load : function(response) {
						if ($defined(response)) {
							if (response.success) {
								if ($defined(response.markers))
									func(layerManager, iconManager,
											response.markers);
							} else {
								if (response.errcode < 0) {
									alert(response.message);
								} else {
									console.error(response.message);
								}
							}
						}
					},
					error : function(response, ioArgs) {
						console.error("HTTP status code: ", ioArgs.xhr.status);
						return response;
					}
				});
			},
			/**
			 * Parses the response data and retrieves list of 2D markers. This
			 * new list updates the existing 2D markers layer.
			 * 
			 * @param {Object}
			 *            Layer manager.
			 * @param {Object}
			 *            JSON response.
			 */
			__update2DMarkers : function(layerManager, iconManager, data) {
				for ( var i = 0; i < data.length; i++) {
					/* Scaling adjustment. */
					data[i].x = (data[i].x * woolz.model.scl.cur) / data[i].scale;
					data[i].y = (data[i].y * woolz.model.scl.cur) / data[i].scale;

					/* Tileframe adjustment. */
					data[i].x += woolz.model.adjust[0];
					data[i].y += woolz.model.adjust[1];
					var temp = new Marker2D(iconManager, data[i].id,
							data[i].label, data[i].description, data[i].resources, data[i].x, data[i].y,
							"bookmark");
					layerManager.addAnnotationToLayer("2Dmarkers", temp);
				}
			},
			
			/**
			 * Parses the response data and retrieves list of 2D regions. This
			 * new list updates the existing 2D regions layer.
			 * 
			 * @param {Object}
			 *            JSON response.
			 */
			__update2DRegions : function(layerManager, data) {
				for ( var i = 0; i < data.length; i++) {
					var pl = data[i].polyline;
					for ( var j = 0; j < pl.length; j++) {
						/* Scaling adjustment. */
						pl[j].x = (pl[j].x * woolz.model.scl.cur)
								/ data[i].scale;
						pl[j].y = (pl[j].y * woolz.model.scl.cur)
								/ data[i].scale;

						/* Tileframe adjustment. */
						pl[j].x += woolz.model.adjust[0];
						pl[j].y += woolz.model.adjust[1];
					}
					var temp = new Region2D(data[i].id, data[i].label,
							data[i].description, data[i].resources, data[i].tl_x, data[i].tl_y,
							data[i].br_x, data[i].br_y, pl);
					layerManager.addAnnotationToLayer("2Dregions", temp);
				}
			},

			/**
			 * Retrieves 2D regions from the annotation server.
			 * 
			 * This method uses Dojo.xhr Ajax interface for retrieving
			 * annotations which are 2D regions. Only those regions which fall
			 * inside a 2D bounding box is retrieved. The bounding box is
			 * specified by its top-left (xl, yl) and bottom-right (xh, yh)
			 * coordinates. We assume that the origin is at the top-left corner
			 * of the Dojo surface.
			 * 
			 * @param {Integer}
			 *            lid Unique ID of parent layer for the regions.
			 * 
			 * @param {Integer}
			 *            xl x-coordinate of top-left corner.
			 * @param {Integer}
			 *            yl y-coordinate of top-left corner.
			 * @param {Integer}
			 *            xh x-coordinate of bottom-right corner.
			 * @param {Integer}
			 *            yh y-coordinate of bottom-right corner.
			 * @param {Integer}
			 *            sl Lowest scale to include.
			 * @param {Integer}
			 *            sh Highest scale to include.
			 */
			get2DRegions : function(lid, xl, yl, xh, yh, sl, sh) {
				var func = this.__update2DRegions;
				var layerManager = this.layerManager;
				dojo.xhrGet( {
					url : "get2DRegions.php?lid=" + lid + "&x_low=" + xl
							+ "&x_high=" + xh + "&y_low=" + yl + "&y_high="
							+ yh + "&scale_low=" + sl + "&scale_high=" + sh
							+ "&format=json",
					handleAs : "json",
					timeout : 5000, /* Time in milliseconds. */
					sync : true,
					load : function(response) {
						if ($defined(response)) {
							if (response.success) {
								if ($defined(response.regions)) {
									try {
									func(layerManager, response.regions);
									} catch (err) {
										console.error("get2DRegions:");
									}
								}
							} else {
								if (response.errcode < 0) {
									alert(response.message);
								} else {
									console.error(response.message);
								}
							}
						}
					},
					error : function(response, ioArgs) {
						console.error("HTTP status code: ", ioArgs.xhr.status);
						return response;
					}
				});
			},

			/**
			 * Is the supplied point close to the start of the region polyline?
			 * If this returns true, the polyline will be closed to form a
			 * polygon.
			 * 
			 * @param {Integer}
			 *            x Current x-coordinate.
			 * @param {Integer}
			 *            y Current y-coordinate.
			 */
			__isCloseToFinalPoint : function(x, y) {
				if (this.regionPoints.length > 1
						&& this.regionPoints[0].x - 6 < x
						&& this.regionPoints[0].x + 6 > x
						&& this.regionPoints[0].y - 6 < y
						&& this.regionPoints[0].y + 6 > y)
					return true;
				else
					return false;
			},

			/**
			 * Creates a region by connecting polyline points.
			 * 
			 * @param {Object}
			 *            grpRegion Surface group for displaying region.
			 * @param {Integer}
			 *            x x-coordinate of the polyline point.
			 * @param {Integer}
			 *            y y-coordinate of the polyline point.
			 */
			createRegion : function(grpRegion, px, py, x, y) {
				/*
				 * Is the the screen coordinate. All screen related
				 * functionalities (measurement, polyline creation etc.) are
				 * carried out using screen coordinates.
				 */
				var t = {
					x : px,
					y : py
				};
				this.regionPoints.push(t);

				/*
				 * This is the coordinate relative to the tileframe where the
				 * model has been displayed. All annotations are created using
				 * this coordinate.
				 */
				var q = {
					x : x,
					y : y
				};
				this.tempRegionPoints.push(q);

				/* Check if this is the final connection. */
				if (this.__isCloseToFinalPoint(px, py)) {
					/* Display the finished region. */
					grpRegion.clear();
					var regionPolyline = grpRegion
							.createPolyline(this.regionPoints);
					regionPolyline.setStroke( {
						color : "white",
						width : 2
					});
					regionPolyline.setFill( [ 255, 255, 0, 0.25 ]);

					/*
					 * Open the region creation dialog box for adding details to
					 * the region annotation.
					 */
					ngembryo.dialogManager.create2DRegion(
							this.tempRegionPoints, woolz.model.scl.cur,
							ngembryo.lid);

					/* Clear the array and make it ready for the next region. */
					this.regionPoints = [];
					this.tempRegionPoints = [];
				}
			},

			/**
			 * Activates the create canvas (for 2D marker annotation) overlay
			 * over the target canvas.
			 * 
			 * Existing markers and regions that are displayed on the target
			 * canvas will be inactive but visible through a translucent veil.
			 * This helps the user to see what is already marked so that clutter
			 * is reduced.
			 */
			activateCreateCanvas2DMarker : function() {
				if ($defined(this.surface)) {
					var grpCC = this.surface.createGroup();
					grpCC.description = "Annotation Creation Canvas: 2D Markers";
					var dim = this.surface.getDimensions();
					var cc = grpCC.createRect( {
						x : 0,
						y : 0,
						height : dim.height,
						width : dim.width
					});
					/* TODO: Change colors. */
					cc.setFill( [ 0, 0, 100, 0.5 ]);
					cc.setStroke( {
						color : "blue",
						width : 0
					});
					dojo.style(cc.getNode(), "cursor", "crosshair");
					// dojo.attr(cc.getNode(), "id", "create2DMarkerCanvas");

					/* Event handling when mouse over marker icon. */
					var handleMouseOverIcon = function(event) {
						var x = event.clientX - ngembryo.engine.dim.x;
						var y = event.clientY - ngembryo.engine.dim.y;
						console.info("x: " + x + ", y:" + y);

						/* Tileframe adjustment. */
						var px = x - woolz.model.adjust[0];
						var py = y - woolz.model.adjust[1];
						
						/*
						 * Only act on this position if it falls inside the
						 * tileframe, where the images of the models are
						 * displayed.
						 */
						if (px >= 0
								&& py >= 0
								&& px < woolz.tileframe.tileFrameContainer.offsetWidth
								&& py < woolz.tileframe.tileFrameContainer.offsetHeight) {
							ngembryo.dialogManager.create2DMarker(px, py,
									woolz.model.scl.cur, ngembryo.lid);
						}
					};
					this.eventCanvas.push(dojo.connect(cc.getNode(), "onclick",
							handleMouseOverIcon));

					/*
					 * Put a label to hint creation canvas is active state.
					 */
					var ccLabel = grpCC.createText( {
						x : 5,
						y : 15,
						text : grpCC.description
					});

					/* TODO: Better to put this separately. */
					ccLabel.setFont( {
						family : "Arial",
						size : "9pt",
						style : "regular",
						weight : "bold"
					});
					ccLabel.setFill("#ffffff");
				} else {
					console.error("Undefined Dojo surface.");
				}
			},

			/**
			 * Activates the create canvas (for 2D region annotation) overlay
			 * over the target canvas.
			 * 
			 * Existing markers and regions that are displayed on the target
			 * canvas will be inactive but visible through a translucent veil.
			 * This helps the user to see what is already marked so that clutter
			 * is reduced.
			 */
			activateCreateCanvas2DRegion : function() {
				if ($defined(this.surface)) {
					this.regionPoints = [];
					this.tempRegionPoints = [];
					var grpCC = this.surface.createGroup();
					var grpRegion = this.surface.createGroup();
					grpCC.description = "Annotation Creation Canvas: 2D Region";
					var dim = this.surface.getDimensions();
					var cc = grpCC.createRect( {
						x : 0,
						y : 0,
						height : dim.height,
						width : dim.width
					});
					/* TODO: Change colors. */
					cc.setFill( [ 0, 0, 100, 0.5 ]);
					cc.setStroke( {
						color : "blue",
						width : 0
					});
					dojo.style(cc.getNode(), "cursor", "crosshair");
					// dojo.attr(cc.getNode(), "id", "create2DRegionCanvas");

					var handleCreateCanvasClick = function(event) {
						var x = event.clientX - ngembryo.engine.dim.x;
						var y = event.clientY - ngembryo.engine.dim.y;

						/* Tileframe adjustment. */
						var px = x - woolz.model.adjust[0];
						var py = y - woolz.model.adjust[1];

						/*
						 * Only act on this position if it falls inside the
						 * tileframe, where the images of the models are
						 * displayed.
						 */
						if (px >= 0
								&& py >= 0
								&& px < woolz.tileframe.tileFrameContainer.offsetWidth
								&& py < woolz.tileframe.tileFrameContainer.offsetHeight) {
							var temp = ngembryo.engine.createRegion(grpRegion,
									x, y, px, py);
						}
					};
					this.eventCanvas.push(dojo.connect(cc.getNode(), "onclick",
							handleCreateCanvasClick));

					this.eventCanvas
							.push(dojo
									.connect(
											cc.getNode(),
											"onmousemove",
											function(event) {
												if (ngembryo.engine.regionPoints.length > 0) {
													var x = event.clientX
															- ngembryo.engine.dim.x;
													var y = event.clientY
															- ngembryo.engine.dim.y;

													/**
													 * When the mouse pointer
													 * moves around the canvas,
													 * a line is drawn
													 * dynamically by joining
													 * the current mouse pointer
													 * position to the last
													 * point in the existing
													 * region polyline. Since
													 * the mouse onclick event
													 * is associated with the
													 * create canvas, we should
													 * not draw this dynamic
													 * line exactly using the
													 * current position of the
													 * mouse pointer. If this is
													 * not adjusted the mouse
													 * click event will never be
													 * triggered, since the
													 * onclick mouse event will
													 * be associated with the
													 * dynamic line. We
													 * therefore adjust the
													 * moving end of the line to
													 * not cover the create
													 * canvas.
													 */
													var px = x;
													var py = y;
													var p = ngembryo.engine.regionPoints;
													var l = ngembryo.engine.regionPoints.length - 1;
													if (p[l].x <= px)
														px--;
													else
														px++;
													if (p[l].y <= py)
														py--;
													else
														py++;

													if (ngembryo.engine
															.__isCloseToFinalPoint(
																	px, py)) {
														px = ngembryo.engine.regionPoints[0].x;
														py = ngembryo.engine.regionPoints[0].y;
													}
													var t = {
														x : px,
														y : py
													};

													ngembryo.engine.regionPoints
															.push(t);
													if (ngembryo.engine.regionPoints.length > 0) {
														dojo
																.forEach(
																		ngembryo.engine.eventLastPoint,
																		dojo.disconnect);
														ngembryo.engine.eventLastPoint = [];
													}
													grpRegion.clear();

													var regionPolyline = grpRegion
															.createPolyline(ngembryo.engine.regionPoints);
													regionPolyline.setStroke( {
														color : "yellow"
													});
													ngembryo.engine.regionPoints
															.pop();
													var circ = grpRegion
															.createCircle( {
																cx : ngembryo.engine.regionPoints[0].x,
																cy : ngembryo.engine.regionPoints[0].y,
																r : 5
															});

													circ.setFill( [ 255, 255,
															255, 1 ]);
													circ.setStroke("blue");
													ngembryo.engine.eventLastPoint
															.push(dojo
																	.connect(
																			circ
																					.getNode(),
																			"onclick",
																			function(
																					event) {
																				/*
																				 * Since
																				 * clicking
																				 * on
																				 * the
																				 * circle
																				 * means
																				 * that
																				 * the
																				 * user
																				 * want
																				 * to
																				 * conclude
																				 * creating
																				 * the
																				 * region
																				 * by
																				 * closing
																				 * the
																				 * polyline,
																				 * we
																				 * ignore
																				 * the
																				 * current
																				 * mouse,
																				 * and
																				 * pass
																				 * the
																				 * coordinates
																				 * of
																				 * the
																				 * first
																				 * point
																				 * instead.
																				 */
																				ngembryo.engine
																						.createRegion(
																								grpRegion,
																								ngembryo.engine.regionPoints[0].x,
																								ngembryo.engine.regionPoints[0].y,
																								ngembryo.engine.tempRegionPoints[0].x,
																								ngembryo.engine.tempRegionPoints[0].y);
																				dojo
																						.forEach(
																								ngembryo.engine.eventLastPoint,
																								dojo.disconnect);
																			}));
													ngembryo.engine.eventLastPoint
															.push(dojo
																	.connect(
																			circ
																					.getNode(),
																			"onmouseenter",
																			function(
																					event) {
																				circ
																						.setFill( [
																								0,
																								255,
																								0,
																								1 ]);
																			}));
													ngembryo.engine.eventLastPoint
															.push(dojo
																	.connect(
																			circ
																					.getNode(),
																			"onmouseleave",
																			function(
																					event) {
																				circ
																						.setFill( [
																								255,
																								255,
																								255,
																								1 ]);
																			}));
												}
											}));

					/*
					 * Put a label to hint the user that creation canvas is
					 * active.
					 */
					var ccLabel = grpCC.createText( {
						x : 5,
						y : 15,
						text : grpCC.description
					});

					/* TODO: Better to put this separately. */
					ccLabel.setFont( {
						family : "Arial",
						size : "9pt",
						style : "regular",
						weight : "bold"
					});
					ccLabel.setFill("#ffffff");

				} else {
					console.error("Undefined Dojo surface.");
				}
			},

			/**
			 * Finds the centroid of a ploygon.
			 */
			__findPolygonCentroid : function() {
				var tx = 0, ty = 0, c = new Array(2);
				for ( var i = 0; i < this.regionPoints.length; i++) {
					tx += this.regionPoints[i].x;
					ty += this.regionPoints[i].y;
				}
				c[0] = tx / this.regionPoints.length;
				c[1] = ty / this.regionPoints.length;
				return c;
			},

			/**
			 * TODO: Finds the area of a 3D planar polygon. Algorithm from:
			 * http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm
			 */
			/**
			 * Finds the area of a 2D polygon.
			 * 
			 * Uses algorithm by Darel Rex Finley.
			 * http://alienryderflex.com/polygon_area/
			 */
			__findAreaOfPolygon : function() {
				var area = 0.0;
				for ( var i = 0, j = 0; i < this.regionPoints.length; i++) {
					j++;
					if (j == this.regionPoints.length)
						j = 0;
					area += (this.regionPoints[i].x + this.regionPoints[j].x)
							* (this.regionPoints[i].y - this.regionPoints[j].y);
				}

				/*
				 * We return the absolute value because the area of the polygon
				 * is positive when the polygon is counter-clockwise; negative
				 * if clockwise. The area remains the same (except for the
				 * sign).
				 */
				return Math.abs(area * 0.5);
			},

			/**
			 * Draw the polyline with the segment lengths and area (if polygon).
			 */
			__drawPolylineWithMeasurements : function(grpRegion, polygon) {
				if (this.tempRegionPoints.length > 0) {
					/* Display the polyline. */
					grpRegion.clear();
					var regionPolyline = grpRegion
							.createPolyline(this.regionPoints);
					if (polygon) {
						regionPolyline.setFill( [ 0, 0, 100, 0.8 ]);
						border = "blue";
					}
					regionPolyline.setStroke( {
						color : "blue",
						width : 2
					});

					/*
					 * For each of the line segments, find take the
					 * measurements.
					 */
					var segments = new Array();
					var x, y, xd, yd, d, p1x, p1y, p2x, p2y, t;
					t = this.tempRegionPoints.length - 1;
					this.circumference = 0;
					for ( var i = 0; i < t; i++) {
						p1x = this.regionPoints[i].x;
						p2x = this.regionPoints[i + 1].x;
						p1y = this.regionPoints[i].y;
						p2y = this.regionPoints[i + 1].y;

						/* Find the mid point of the line segment. */
						x = (p1x + p2x) / 2;
						y = (p1y + p2y) / 2;

						/* Length of the line segment (on screen). */
						xd = p2x - p1x;
						yd = p2y - p1y;
						d = Math.round(Math.sqrt(xd * xd + yd * yd));
						this.circumference += d;

						/* Display the length at the midpoint. */
						var ccLabel = grpRegion.createText( {
							x : x + 5, /* Displace by 5 pixels. */
							y : y,
							text : d
						});
						ccLabel.setFont( {
							family : "Arial",
							size : "9pt",
							style : "regular",
							weight : "bold"
						});
						ccLabel.setFill("#ffffff");
					}
					segments = null;
				}
			},

			/**
			 * Creates a region by connecting polyline points.
			 * 
			 * @param {Object}
			 *            grpRegion Surface group for displaying region.
			 * @param {Integer}
			 *            x x-coordinate of the polyline point.
			 * @param {Integer}
			 *            y y-coordinate of the polyline point.
			 */
			measure : function(grpRegion, px, py, x, y) {
				var t = {
					x : px,
					y : py
				};
				this.regionPoints.push(t);
				var q = {
					x : x,
					y : y
				};
				this.tempRegionPoints.push(q);

				/*
				 * Get the 3D woolz coordinate of this point. TODO: This will be
				 * used to calsulate the actual coordinates in 3D, and then to
				 * calculate the area dn circumference in 3D.
				 */
				/*
				 * woolz.model.getWlzCoordinate(x, y, function(response){
				 * ngembryo.engine.actual3Dcoord = response.split(" "); });
				 */
				/* Check if this is the final connection. */
				if (this.__isCloseToFinalPoint(px, py)) {
					/* Get the measurements. */
					this.__drawPolylineWithMeasurements(grpRegion, true);

					/* Display the area and circumference of the polygon. */
					var c = this.__findPolygonCentroid();
					var a = this.__findAreaOfPolygon();
					var ccLabel = grpRegion.createText( {
						x : c[0] - 15, /* Adjust for label "Area:". */
						y : c[1] - 7, /* Adjust for multiline. */
						text : "Area: " + a
					});
					ccLabel.setFont( {
						family : "Arial",
						size : "9pt",
						style : "regular",
						weight : "bold"
					});
					ccLabel.setFill("#ffff00");

					var ccLabel = grpRegion.createText( {
						x : c[0] - 15, /* Adjust for label "Circ:". */
						y : c[1] + 7, /* Adjust for multiline. */
						text : "Circ: " + this.circumference
					});
					ccLabel.setFont( {
						family : "Arial",
						size : "9pt",
						style : "regular",
						weight : "bold"
					});
					ccLabel.setFill("#ffff00");

					/* Clear the array and make it ready for the next region. */
					this.regionPoints = [];
					this.tempRegionPoints = [];
					this.circumference = 0;
				}
			},

			activateMeasurementCanvas : function() {
				if ($defined(this.surface)) {
					this.regionPoints = [];
					this.tempRegionPoints = [];
					var grpCC = this.surface.createGroup();
					var grpRegion = this.surface.createGroup();
					grpCC.description = "Measurement Canvas";
					var dim = this.surface.getDimensions();
					var cc = grpCC.createRect( {
						x : 0,
						y : 0,
						height : dim.height,
						width : dim.width
					});
					/* TODO: Change colors. */
					cc.setFill( [ 0, 0, 100, 0.5 ]);
					cc.setStroke( {
						color : "blue",
						width : 0
					});
					dojo.style(cc.getNode(), "cursor", "crosshair");

					this.eventCanvas
							.push(dojo
									.connect(
											cc.getNode(),
											"onclick",
											function(event) {
												var x = event.clientX
														- ngembryo.engine.dim.x;
												var y = event.clientY
														- ngembryo.engine.dim.y;

												/* Tileframe adjustment. */
												var px = x
														- woolz.model.adjust[0];
												var py = y
														- woolz.model.adjust[1];

												/*
												 * Only act on this position if
												 * it falls inside the
												 * tileframe, where the images
												 * of the models are displayed.
												 */
												if (px >= 0
														&& py >= 0
														&& px < woolz.tileframe.tileFrameContainer.offsetWidth
														&& py < woolz.tileframe.tileFrameContainer.offsetHeight) {
													ngembryo.engine.measure(
															grpRegion, x, y,
															px, py);
												}
											}));
					this.eventCanvas
							.push(dojo
									.connect(
											cc.getNode(),
											"onmousemove",
											function(event) {
												if (ngembryo.engine.regionPoints.length > 0) {
													var x = event.clientX
															- ngembryo.engine.dim.x;
													var y = event.clientY
															- ngembryo.engine.dim.y;

													/**
													 * When the mouse pointer
													 * moves around the canvas,
													 * a line is drawn
													 * dynamically by joining
													 * the current mouse pointer
													 * position to the last
													 * point in the existing
													 * region polyline. Since
													 * the mouse onclick event
													 * is associated with the
													 * create canvas, we should
													 * not draw this dynamic
													 * line exactly using the
													 * current position of the
													 * mouse pointer. If this is
													 * not adjusted the mouse
													 * click event will never be
													 * triggered, since the
													 * onclick mouse event will
													 * be associated with the
													 * dynamic line. We
													 * therefore adjust the
													 * moving end of the line to
													 * not cover the create
													 * canvas.
													 */
													var px = x;
													var py = y;
													var p = ngembryo.engine.regionPoints;
													var l = ngembryo.engine.regionPoints.length - 1;
													if (p[l].x <= px)
														px--;
													else
														px++;
													if (p[l].y <= py)
														py--;
													else
														py++;

													if (ngembryo.engine
															.__isCloseToFinalPoint(
																	px, py)) {
														px = ngembryo.engine.regionPoints[0].x;
														py = ngembryo.engine.regionPoints[0].y;
													}
													var t = {
														x : px,
														y : py
													};

													ngembryo.engine.regionPoints
															.push(t);
													if (ngembryo.engine.regionPoints.length > 0) {
														dojo
																.forEach(
																		ngembryo.engine.eventLastPoint,
																		dojo.disconnect);
														ngembryo.engine.eventLastPoint = [];
													}
													ngembryo.engine
															.__drawPolylineWithMeasurements(
																	grpRegion,
																	false);
													ngembryo.engine.regionPoints
															.pop();
													var circ = grpRegion
															.createCircle( {
																cx : ngembryo.engine.regionPoints[0].x,
																cy : ngembryo.engine.regionPoints[0].y,
																r : 5
															});
													circ.setFill( [ 255, 255,
															255, 1 ]);
													circ.setStroke("blue");
													ngembryo.engine.eventLastPoint
															.push(dojo
																	.connect(
																			circ
																					.getNode(),
																			"onclick",
																			function(
																					event) {
																				/*
																				 * Since
																				 * clicking
																				 * on
																				 * the
																				 * circle
																				 * means
																				 * that
																				 * the
																				 * user
																				 * want
																				 * to
																				 * conclude
																				 * creating
																				 * the
																				 * region
																				 * by
																				 * closing
																				 * the
																				 * polyline,
																				 * we
																				 * ignore
																				 * the
																				 * current
																				 * mouse,
																				 * and
																				 * pass
																				 * the
																				 * coordinates
																				 * of
																				 * the
																				 * first
																				 * point
																				 * instead.
																				 */
																				ngembryo.engine
																						.measure(
																								grpRegion,
																								ngembryo.engine.regionPoints[0].x,
																								ngembryo.engine.regionPoints[0].y,
																								ngembryo.engine.tempRegionPoints[0].x,
																								ngembryo.engine.tempRegionPoints[0].y);
																				dojo
																						.forEach(
																								ngembryo.engine.eventLastPoint,
																								dojo.disconnect);
																			}));
													ngembryo.engine.eventLastPoint
															.push(dojo
																	.connect(
																			circ
																					.getNode(),
																			"onmouseenter",
																			function(
																					event) {
																				circ
																						.setFill( [
																								0,
																								255,
																								0,
																								1 ]);
																			}));
													ngembryo.engine.eventLastPoint
															.push(dojo
																	.connect(
																			circ
																					.getNode(),
																			"onmouseleave",
																			function(
																					event) {
																				circ
																						.setFill( [
																								255,
																								255,
																								255,
																								1 ]);
																			}));
												}
											}));

					/*
					 * Put a label to hint the user that creation canvas is
					 * active.
					 */
					var ccLabel = grpCC.createText( {
						x : 5,
						y : 15,
						text : grpCC.description
					});

					/* TODO: Better to put this separately. */
					ccLabel.setFont( {
						family : "Arial",
						size : "9pt",
						style : "regular",
						weight : "bold"
					});
					ccLabel.setFill("#ffffff");

				} else {
					console.error("Undefined Dojo surface.");
				}
			}
		});
