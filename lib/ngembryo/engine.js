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
var AnnotationEngine = new Class( {
	initialize : function(target) {
		/* Unique DOM ID of the target frame div. */
		this.target = target;
		/* DOM element where the Dojo surface is created. */
		this.parent = null;
		/* Dimension of the target frame (this.parent). */
		this.dim = null;
		/* Initialise cookie manager. */
		this.cm = new CookieManager();
		/* If true, displays controls. */
		this.cn = this.cm.get("controlsOn", true);
		/* If true, controls are usable. */
		this.ca = this.cm.get("controlsActive", true);
		/* If true, displays markers. */
		this.mV = this.cm.get("m2dv", true);
		/* If true, displays 3D markers. */
		this.m3DV = this.cm.get("m3dv", true);
		/* If true, displays regions. */
		this.rV = this.cm.get("r2dv", true);
		this.cc = false; /* If true, display create canvas. */
		this.cct = 1; /* Type of annotation to be created. */
		this.ccte = {
			m : 1,
			r : 2,
			s : 3
		}; /* Enumeration of accepted annotation types. */
		this.ccHandler = null; /* Handles annotation creation. */
		this.evs = []; /* Canvas event handlers. */
		this.evsl = []; /* Polyline completion event. */
		this.surface = null; /* Dojo surface for annotations. */
		this.layers = null; /* Manages the annotation layers. */
		this.icons = null; /* Manages the marker icons. */
		this.labels = null; /* For rendering labels properly. */
		this.rp = new Array(); /* For creating polyline. */
		/* Holds polyline coordinates relative to tileframe. */
		this._rp = new Array();
		this.cir = 0; /* TODO: Circumference of polygon. */
		/* Array of search parameters. */
		this.sp = [ {
			s : 0,
			m : 0
		}, {
			s : 0,
			m : 0
		}, {
			s : 0,
			m : 0
		}, {
			s : 0,
			m : 0
		} ];

		/* Used for highlighting annotation from search. */
		this.sa = {
			i : -1,
			t : -1
		};
	},

	/**
	 * Register the icons.
	 * 
	 * @param {String}
	 *            p Path where the icons are located.
	 */
	__RI : function(p) {
		this.im = new IconManager();
		if ($defined(this.im)) {
			this.im.registerIcon('default', new Icon(p + 'Marker.png', 16, 16,
					'cc'));
			this.im.registerIcon('bookmark', new Icon(p + 'bookmark.png', 16,
					16, 'dd'));
			this.im.registerIcon('filefind', new Icon(p + 'filefind.png', 16,
					16, 'cc'));
			this.im.registerIcon('activity', new Icon(p + 'activity.png', 16,
					16, 'cc'));
		}
	},

	/**
	 * Register layers.
	 */
	__RL : function() {
		this.lm = new LayerManager();
		if ($defined(this.lm)) {
			/**
			 * TODO:For the moment, we have no ordering of layers. So, the last
			 * layer added will be displayed on the top.
			 */
			this.lm.addLayer('regions', true);
			this.lm.addLayer('markers', true);
		}
	},

	/**
	 * Start the engine.
	 */
	start : function() {
		if ($defined(this.target)) {
			/* Targetframe DOM element for Dojo surface creation. */
			this.parent = dojo.byId(this.target);
			/* Get dimension of the target frame DOM element. */
			this.dim = dojo.coords(this.parent);

			this.__CS(); /* Create a Dojo surface. */
			this.__RI('resources/images/'); /* Register the icons. */
			this.__RL(); /* Register layers. */
		} else {
			console.error("Undefined target DOM element.")
		}
	},

	/**
	 * Destroy the engine.
	 */
	destroy : function() {
		this.lm.destroy();
		this.im.destroy();
		this.surface.clear();
	},

	/**
	 * Format form for search.
	 */
	__getForm : function(url) {
		var form = null;
		dojo.xhrGet( {
			url : url,
			handleAs : "text",
			sync : true,
			timeout : 5000, /* Time in milliseconds. */
			load : function(response, ioArgs) {
				form = response;
			},
			error : function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
			}
		});
		return form;
	},

	/**
	 * Format search results.
	 */
	__fSR : function(results, type) {
		var content = ""
		if (!$defined(results)) {
			return "Search was unsuccessful. Please try again.<br>"
		}
		if (results.length < 1) {
			return "<br>Search did not match any item.<br>"
		}
		content = "<div class='search-result-browser'>"
				+ "<div class='search-listing'>" + "<table class='items' "
				+ "id='search-result-table'>";

		switch (type) {
		case 0:
		case 1:
		case 2:
			for ( var i = 0; i < results.length; i++) {
				var rowClass = (i % 2) ? "oddRow" : "evenRow";
				rowClass += " clickable' " + "onClick='ngembryo.engine.goTo("
						+ results[i].i + "," + type + "," + results[i].m + ","
						+ results[i].o + "," + results[i].l + ","
						+ results[i].s + ");";
				content += "<tr class='" + rowClass + "'><td>"
						+ "<div class='stitle'>" + results[i].t + "</div>"
						+ "<div class='sabstract'>" + results[i].d
						+ "</div></td></tr>";
			}
			break;
		case 3:
			for ( var i = 0; i < results.length; i++) {
				var rowClass = (i % 2) ? "oddRow" : "evenRow";
				rowClass += " clickable' " + "onClick='window.open(\""
						+ results[i].l + "\");";
				content += "<tr class='" + rowClass + "'>"
						+ "<div class='rauthor'>" + results[i].a + "</div>"
						+ "<div class='rtitle'>" + results[i].t + "</div>"
						+ "<div class='rdesc'>" + results[i].d
						+ "</div></td></tr>";
			}
			break;
		}

		content += "</table></div>";

		var theForm = dojo.byId("search-form");
		var t = theForm['type'].value;
		var l = parseInt(theForm['limit'].value);
		if (this.sp[t].s - l < 0) {
		} else {
			content += "<div class='prev' "
					+ "onClick='ngembryo.engine.__pssr();'>"
					+ "<< previous</div>";
		}

		if (this.sp[t].s + l > this.sp[t].m) {
		} else {
			content += "<div class='next' "
					+ "onClick='ngembryo.engine.__nssr();'>" + "next >></div>";
		}

		content += "</div>";
		return content;
	},

	/**
	 * Go to the search item.
	 * 
	 * @param i
	 *            Unique identifier of the searched annotation.
	 * @param t
	 *            Type of the searched annotation.
	 * 
	 * @param m
	 *            The model where the item is found.
	 * @param o
	 *            The orientation within the model.
	 * @param l
	 *            The layer within the orientation.
	 * @param s
	 *            The zoom scale in which the item exists.
	 */
	goTo : function(i, t, m, o, l, s) {
		this.sa.i = i;
		this.sa.t = t;
		if (ngembryo.mid != m)
			ngembryo.models.createEmbryoModel(m);
		if (ngembryo.oid != o)
			ngembryo.orientation.select(o);
		if (ngembryo.lid != l)
			ngembryo.layer.select(l);
		var z = Math.log(s) / Math.LN2;
		ngembryo.zoomSlider.set(z);

		var sd = dijit.byId("search-dialog");
		if ($defined(sd)) {
			dojo.body().removeChild(sd.domNode);
			sd.destroyRecursive(false);
		}
	},

	/**
	 * List next set of search results.
	 */
	__nssr : function() {
		var theForm = dojo.byId("search-form");
		var t = theForm['type'].value;
		var s = parseInt(theForm['start'].value)
				+ parseInt(theForm['limit'].value);
		if (s > this.sp[t].m) {
		} else {
			this.sp[t].s = s;
		}
		theForm['start'].value = this.sp[t].s;
		this.__GPSR();
	},

	/**
	 * List previous set of search results.
	 */
	__pssr : function() {
		var theForm = dojo.byId("search-form");
		var t = theForm['type'].value;
		var s = parseInt(theForm['start'].value)
				- parseInt(theForm['limit'].value);
		if (s < 0) {
		} else {
			this.sp[t].s = s;
		}
		theForm['start'].value = this.sp[t].s;
		this.__GPSR();
	},

	/**
	 * Reset search result listing start.
	 */
	__rss : function() {
		var theForm = dojo.byId("search-form");
		this.sp[0].s = 0;
		this.sp[1].s = 0;
		this.sp[2].s = 0;
		this.sp[3].s = 0;
	},

	/**
	 * Changes the search mode.
	 */
	__csm : function(i) {
		var theForm = dojo.byId("search-form");
		theForm['type'].value = i;
		theForm['start'].value = ngembryo.engine.sp[i].s;
		this.__GPSR();
	},
	/**
	 * Display match count.
	 */
	__dMC : function(t) {
		var k = function(i) {
			var theForm = dojo.byId("search-form");
			if (i == theForm['type'].value) {
				return "<td class='search-item-selected'>"
			} else {
				return "<td class='search-item' "
						+ "onclick='ngembryo.engine.__csm(" + i + ");'>"
			}
		}
		var s = "<td class='separator'></td>";
		var c = "<tr class='search-match-count'>";
		c += s + k(0) + t.m + " markers</td>" + s;
		c += k(1) + t.r + " regions</td>" + s;
		c += k(2) + t.l + " layers</td>" + s;
		c += k(3) + t.rs + " resources</td>" + s + "</tr>";
		return c;
	},

	/**
	 * Display search result.
	 */
	__dSR : function(response) {
		var c = "<table class='search-result'>";
		c += this.__dMC(response.n);

		this.sp[0].m = response.n.m - 1;
		this.sp[1].m = response.n.r - 1;
		this.sp[2].m = response.n.l - 1;
		this.sp[3].m = response.n.rs - 1;

		c += "<tr><td colspan='9'>" + this.__fSR(response.r, response.t)
				+ "</td></tr></table>";
		dojo.byId("search-result").innerHTML = c;

		var h = dojo.style("search-dialog", "height");
		var wh = window.getHeight();
		t = (wh - h) / 2;
		dojo.style("search-dialog", "top", t + "px");
	},

	/**
	 * Get-process search result.
	 */
	__GPSR : function() {
		dojo.xhrGet( {
			url : "onesearch.php",
			form : "search-form",
			handleAs : "json",
			load : function(response, ioArgs) {
				if ($defined(response)) {
					if (response.success) {
						this.__dSR(response);
					} else {
						ngembryo.content.feedback
								.show("warn", response.message);
					}
				}
			}.bind(this),
			error : function(response, ioArgs) {
				ngembryo.content.feedback.show("error", "HTTP status code ("
						+ ioArgs.xhr.status
						+ ") : Failure to process server response");
				return response;
			}
		});
	},

	/**
	 * Shows the search dialog.
	 */
	search : function() {
		var sd = dijit.byId("search-dialog");
		if ($defined(sd)) {
			dojo.body().removeChild(sd.domNode);
			sd.destroyRecursive(false);
		}
		sd = new dijit.Dialog( {
			id : "search-dialog",
			title : "Search",
			style : "width: 600px;",
			content : this.__getForm("sF.php")
		});
		dojo.body().appendChild(sd.domNode);
		var theForm = dojo.byId("search-form");
		var handle = dojo.connect(theForm, "onsubmit", function(event) {
			/* prevent the form from actually submitting. */
			event.preventDefault();
			this.__GPSR();
		}.bind(this));
		sd.startup();
		sd.show();
	},

	/**
	 * Calculate the visible bounding box for retrieving annotations, related
	 * parameters for placing the annotations.
	 */
	_CBB : function() {
		/* Annotations in this scale. */
		this.scl = woolz.model.scl.cur;

		/* Adjustment to annotation position. */
		this.ax = woolz.model.adjust[0];
		this.ay = woolz.model.adjust[1]

		/* Calculate bounding box. */
		var x_low = -this.ax;
		x_low = x_low < 0 ? 0 : x_low;
		var x_high = x_low + woolz.model.viewable.width;
		var y_low = -this.ay;
		y_low = y_low < 0 ? 0 : y_low;
		var y_high = y_low + woolz.model.viewable.height;

		/* Cache value. */
		this.xl = x_low;
		this.yl = y_low;
		this.xh = x_high;
		this.yh = y_high;
	},

	/**
	 * Retrieve and set marker annotations.
	 */
	_SM : function() {
		if (this.mV && $defined(ngembryo.layer)) {
			this.lm.emptyLayer("markers");
			if ($defined(ngembryo.layer.items)) {
				var t = ngembryo.layer.items;
				for ( var i = 0; i < t.length; i++) {
					if (t[i].visible) {
						this._GM(t[i].id, this.xl, this.yl, this.xh, this.yh,
								this.scl, this.scl);
					}
				}
			}
		}
	},

	/**
	 * Retrieve and set region annotations.
	 */
	_SR : function() {
		if (this.rV && $defined(ngembryo.layer)) {
			this.lm.emptyLayer("regions");
			if ($defined(ngembryo.layer.items)) {
				var t = ngembryo.layer.items;
				for ( var i = 0; i < t.length; i++) {
					if (t[i].visible) {
						this._GR(t[i].id, this.xl, this.yl, this.xh, this.yh,
								this.scl, this.scl);
					}
				}
			}
		}
	},

	/**
	 * Refreshes the screen and draw with current settings.
	 * 
	 * With every refresh invocation, the engine communicated with the
	 * annotation server to retrieve the latest annotations. This is done using
	 * Dojo.xhr.
	 */
	refresh : function() {
		if (woolz && woolz.locator) {
			/*
			 * The parameters in the woolz model determines the manner in which
			 * the annotations are retrieved and position.
			 */
			woolz.refresh();

			if ($defined(this.surface)) {
				this._CBB(); /* Calculate visible area. */
				this._SM(); /* Retrieve and set marker annotations. */
				this._SR(); /* Retrieve and set region annotations. */

				/* Display visible layers. */
				this.surface.clear();
				this.lm.displayVisibleLayers(this.surface);

				/* Show canvas if visible. */
				if (this.cc == true) {
					switch (this.cct) {
					case this.ccte.m:
						this._ACM(); /* Marker */
						break;
					case this.ccte.r:
						this._ACR(); /* Region */
						break;
					case this.ccte.s:
						this._AMC(); /* Measurement */
						break;
					}
				}
			} else {
				console.error("Dojo surface is undefined.");
			}
		}
	},

	/**
	 * Renders the annotation object on the Dojo surface,.
	 * 
	 * @param {Object}
	 *            obj Annotation object to render.
	 */
	render : function(obj) {
		if ($defined(this.surface)) {
			if ($defined(obj)) {
				if (obj.t == 'm')
					this._M(obj);
				else {
					if (obj.t == 'r')
						this._R(obj);
				}
			}
		} else {
			console.error("Undefined Dojo surface.");
		}
	},

	/**
	 * Create content to display inside the tipper.
	 * 
	 * @param {Object}
	 *            resources List of resources.
	 */
	_CT : function(resources) {
		var a = "";
		var b = "";
		if ($defined(resources) && resources.count > 0) {
			var r = resources.resources;
			a = "<ul>";
			for ( var i = 0; i < r.length; i++) {
				a += "<li><span class='title'>" + r[i].title
						+ "</span> by <span class='author'>" + r[i].author
						+ "</span></li>";
			}
			a += "</ul>";
			b = "Annotation linked to <span style='color: #ff0000;'>"
					+ resources.count + "</span> resources. Click for more...";
		} else {
			a = "No resources are currently linked to this annotation.";
		}
		return {
			r : a,
			m : b
		};
	},

	/**
	 * Renders marker over the Dojo surface.
	 * 
	 * @param {Object}
	 *            mo Marker object.
	 */
	_M : function(mo) {
		if (!dojo.isString(mo.icon)) {
			mo.icon = "default";
			console.warn("Using default icon.");
		}
		var i = mo.im.getIcon(mo.icon);
		if (dojo.isObject(i)) {
			/* Create the marker icon. */
			var o = this.surface.createImage( {
				x : mo.x,
				y : mo.y,
				width : i.width,
				height : i.height,
				src : i.src
			});
			var n = o.getNode();
			dojo.style(n, "cursor", "pointer");

			/* Event handling. */
			var i = mo.id;
			var l = mo.l;
			var t = mo.t;
			var d = mo.d;
			var r = mo.r;
			var c = this._CT(r);

			mo.o = o; /* Used for cleanup. */
			mo.e.push(dojo.connect(n, "onmouseenter", function(e) {
				var x = e.clientX - this.dim.x;
				var y = e.clientY - this.dim.y;
				ngembryo.content.tipper.move(x, y);
				ngembryo.content.tipper.show(l, c.r, c.m);
			}.bind(this)));

			mo.e.push(dojo.connect(n, "onmousemove", function(e) {
				var x = e.clientX - this.dim.x;
				var y = e.clientY - this.dim.y;
				ngembryo.content.tipper.move(x, y);
			}.bind(this)));

			mo.e.push(dojo.connect(n, "onmouseleave", function() {
				ngembryo.content.tipper.hide();
			}));

			mo.e.push(dojo.connect(n, "onclick", function() {
				ngembryo.content.tipper.hide();
				ngembryo.resource.displayLinked(i, t, l, d);
			}));

			if (this.isMarkerVisible()) {
				this.surface.add(o);
			} else {
				this.surface.remove(o);
			}
		} else {
			console.error("Faulty icon sub-system.");
		}
	},

	/**
	 * Renders region over the Dojo surface.
	 * 
	 * @param {Object}
	 *            ro Region object.
	 */
	_R : function(ro) {
		var o = this.surface.createPolyline(ro.p);
		o.setStroke( [ 0, 0, 100, 0.25 ]);
		if (this.sa.t == 1 && this.sa.i == ro.id) {
			o.setFill( [ 0, 0, 100, 0.25 ]);
		} else {
			o.setFill( [ 100, 0, 0, 0.25 ]);
		}

		var n = o.getNode();
		dojo.style(n, "cursor", "pointer");

		/* Event handling. */
		var t = ro.t;
		var i = ro.id;
		var l = ro.l;
		var d = ro.d;
		var r = ro.r;
		var c = this._CT(r);

		ro.o = o; /* Used for cleanup. */
		ro.e.push(dojo.connect(n, "onmouseenter", function(e) {
			if (this.sa.t == 1 && this.sa.i == ro.id) {
				o.setFill( [ 0, 0, 255, 0.50 ]);
			} else {
				o.setFill( [ 255, 0, 0, 0.50 ]);
			}
			var x = e.clientX - this.dim.x;
			var y = e.clientY - this.dim.y;
			ngembryo.content.tipper.move(x, y);
			ngembryo.content.tipper.show(l, c.r, c.m);
		}.bind(this)));

		ro.e.push(dojo.connect(n, "onmousemove", function(e) {
			var x = e.clientX - this.dim.x;
			var y = e.clientY - this.dim.y;
			ngembryo.content.tipper.move(x, y);
		}.bind(this)));

		ro.e.push(dojo.connect(n, "onclick", function(e) {
			ngembryo.content.tipper.hide();
			ngembryo.resource.displayLinked(i, t, l, d);
		}.bind(this)));

		ro.e.push(dojo.connect(n, "onmouseleave", function() {
			ngembryo.content.tipper.hide();
			if (this.sa.t == 1 && this.sa.i == ro.id) {
				o.setFill( [ 0, 0, 100, 0.50 ]);
			} else {
				o.setFill( [ 100, 0, 0, 0.50 ]);
			}
		}.bind(this)));

		if (this.isRegionVisible()) {
			this.surface.add(o);
		} else {
			this.surface.remove(o);
		}
	},

	/**
	 * Checks if the controls is active.
	 */
	isControlsActive : function() {
		return this.ca;
	},

	/**
	 * Activates the control.
	 */
	activateControls : function() {
		this.ca = true;
		this.cm.set("controlsActive", this.ca);
	},

	/**
	 * Deactivates the control
	 */
	deactivateControls : function() {
		this.ca = false;
		this.cm.set("controlsActive", this.ca);
	},

	/**
	 * Checks if the controls should be displayed.
	 */
	isControlsVisible : function() {
		return this.cn;
	},

	/**
	 * Display controls.
	 */
	showControls : function() {
		this.cn = true;
		dojo.style("controls", "visibility", "visible");
		this.cm.set("controlsOn", this.cn);
	},

	/**
	 * Hides controls.
	 */
	hideControls : function() {
		this.cn = false;
		dojo.style("controls", "visibility", "hidden");
		this.cm.set("controlsOn", this.cn);
	},

	/**
	 * Toggles control display.
	 */
	toggleControlsVisibility : function() {
		this.cn = !this.cn;
		this.cm.set("controlsOn", this.cn);
	},

	/**
	 * Checks if markers should be displayed.
	 */
	isMarkerVisible : function() {
		return this.mV;
	},

	/**
	 * Displays markers.
	 */
	showMarker : function() {
		this.mV = true;
		this.cm.set("m2dv", this.mV);
		this.refresh();
	},

	/**
	 * Hides markers.
	 */
	hideMarker : function() {
		this.mV = false;
		this.cm.set("m2dv", this.mV);
		this.refresh();
	},

	/**
	 * Toggles display of markers.
	 */
	toggleMarkerVisibility : function() {
		this.mV = !this.mV;
		this.cm.set("m2dv", this.mV);
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
		this.cm.set("m3dv", this.m3DV);
	},

	/**
	 * Hides 3D markers.
	 */
	hideMarker3D : function() {
		this.m3DV = false;
		this.cm.set("m3dv", this.m3DV);
	},

	/**
	 * Toggles display of 3D markers.
	 */
	toggleMarker3DVisibility : function() {
		this.m3DV = !this.m3DV;
		this.cm.set("m3dv", this.m3DV);
		this.refresh();
	},

	/**
	 * Checks if regions should be displayed.
	 */
	isRegionVisible : function() {
		return this.rV;
	},

	/**
	 * Displays regions.
	 */
	showRegion : function() {
		this.rV = true;
		this.cm.set("r2dv", this.rV);
	},

	/**
	 * Hides regions.
	 */
	hideRegion : function() {
		this.rV = false;
		this.cm.set("r2dv", this.rV);
	},

	/**
	 * Toggles display of regions.
	 */
	toggleRegionVisibility : function() {
		this.rV = !this.rV;
		this.cm.set("r2dv", this.rV);
		this.refresh();
	},

	/**
	 * Displays the create canvas.
	 */
	showCreateCanvas : function(type) {
		if (ngembryo.layer.checkLayer()) {
			this.cc = true;
			this.cct = type;
			this.detachDraggingEvent();
			this.detachScrollEvent();
			dojo.style("controls", {
				display : "none"
			});
			switch (this.cct) {
			case this.ccte.m:
				ngembryo.toolbar.disable("createMarker");
				break;
			case this.ccte.r:
				ngembryo.toolbar.disable("createRegion");
				break;
			case this.ccte.s:
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
		dojo.forEach(this.evs, dojo.disconnect);
		this.evs = [];
		this.attachScrollEvent();
		this.attachDraggingEvent();
		dojo.style("controls", {
			display : "block"
		});
		switch (this.cct) {
		case this.ccte.m:
			ngembryo.toolbar.enable("createMarker");
			break;
		case this.ccte.r:
			ngembryo.toolbar.enable("createRegion");
			break;
		case this.ccte.s:
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
	 * Sets the type of annotation to be created using the create canvas.
	 * 
	 * @param {Integer}
	 *            type
	 */
	setCreateCanvasType : function(type) {
		this.cct = type;
	},

	/**
	 * Creates a Dojo surface using the target DOM element.
	 * 
	 * The Dojo surface, if successfully created, is used as a canvas for
	 * drawing all of the annotation (by invoking the draw() method,
	 * 
	 * @see Annotation.
	 */
	__CS : function() {
		if ($defined(this.parent)) {
			this.surface = dojox.gfx.createSurface(this.parent, this.dim.w,
					this.dim.h);
		} else {
			console.error("enging.__CS: Target not DOM.");
		}
	},

	/**
	 * Makes dragging events on the Dojo surface available to the embryo model.
	 * Used for changing the region of interest.
	 */
	attachDraggingEvent : function() {
		return;
		var s = this.surface.getEventSource();
		dojo.style(s, "cursor", "-moz-grab");
		var hds = function(e) {
			this.dragStartX = e.clientX;
			this.dragStartY = e.clientY;
			var xr = woolz.locator.navwidth / window.getWidth();
			var yr = woolz.locator.navheight / window.getHeight();
			dojo.style(s, "cursor", "-moz-grabbing");
			this.mdD = dojo.connect(s, "onmousemove", function(e) {
				var dx = this.dragStartX - e.clientX;
				var dy = this.dragStartY - e.clientY;
				this.dragStartX = e.clientX;
				this.dragStartY = e.clientY;
				dx = Math.round(dx * xr);
				dy = Math.round(dy * yr);
				woolz.locator.moveZone(false, dx, dy);
			});
			this.mdS = dojo.connect(s, "onmouseup", function(e) {
				var dx = this.dragStartX - e.clientX;
				var dy = this.dragStartY - e.clientY;
				dojo.style(s, "cursor", "-moz-grab");
				dojo.disconnect(this.mdD);
				dojo.disconnect(this.mdS);
				dx = Math.round(dx * xr);
				dy = Math.round(dy * yr);
				woolz.locator.moveZone(true, dx, dy);
				ngembryo.refresh();
			});
		};
		this.draggableStart = dojo.connect(s, "onmousedown", hds);
	},

	/**
	 * Removes dragging events from the Dojo surface.
	 */
	detachDraggingEvent : function() {
		return;
		if ($defined(this.draggableStart)) {
			dojo.disconnect(this.draggableStart);
			var s = this.surface.getEventSource();
			dojo.style(s, "cursor", "pointer");
		}
	},

	/**
	 * Makes scroll events on the Dojo surface available to the embryo model.
	 * Used for zooming.
	 */
	attachScrollEvent : function() {
		return;
		this.scrolling = dojo.connect(this.surface.getEventSource(),
				(!dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll"),
				function(e) {
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
			dojo.disconnect(this.surface.getEventSource(),
					(!dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll"));
		}
	},

	/**
	 * Parses the response data and retrieves list of markers. This new list
	 * updates the existing markers layer.
	 * 
	 * @param {Object}
	 *            lm Layer manager.
	 * @param {Object}
	 *            im Icon manager.
	 * @param {Object}
	 *            data JSON response received from the server.
	 */
	__UM : function(lm, im, data) {
		for ( var i = 0; i < data.length; i++) {
			/* Scaling adjustment. */
			data[i].x = (data[i].x * this.scl) / data[i].scale;
			data[i].y = (data[i].y * this.scl) / data[i].scale;

			/* Tileframe adjustment. */
			data[i].x += this.ax;
			data[i].y += this.ay;
			if (this.sa.t == 0 && this.sa.i == data[i].id) {
				icon = "bookmark";
			} else {
				icon = "default";
			}
			var temp = new Marker(im, data[i].id, data[i].label,
					data[i].description, data[i].resources, data[i].x,
					data[i].y, icon);
			lm.addAnnotationToLayer("markers", temp);
		}
	},

	/**
	 * Retrieves markers from the annotation server.
	 * 
	 * This method retrieves markers which falls inside the visible bounding
	 * box. The bounding box is specified by its top-left (xl, yl) and
	 * bottom-right (xh, yh) coordinates. We assume that the origin is at the
	 * top-left corner of the Dojo surface.
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
	_GM : function(lid, xl, yl, xh, yh, sl, sh) {
		dojo.xhrGet( {
			url : "gm.php?lid=" + lid + "&x_low=" + xl + "&x_high=" + xh
					+ "&y_low=" + yl + "&y_high=" + yh + "&scale_low=" + 0
					+ "&scale_high=" + 8 + "&format=json",
			handleAs : "json",
			timeout : 5000,
			sync : true,
			load : function(response) {
				if ($defined(response)) {
					if (response.success) {
						if ($defined(response.markers)) {
							try {
								this.__UM(this.lm, this.im, response.markers);
							} catch (err) {
								console.error("engine._GM: " + e.name + " - "
										+ e.description);
							}
						}
					}
				}
			}.bind(this),
			error : function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
				return response;
			}
		});
	},

	/**
	 * Parses the response data and retrieves list of regions. This new list
	 * updates the existing markers layer.
	 * 
	 * @param {Object}
	 *            lm Layer manager.
	 * @param {Object}
	 *            data JSON response.
	 */
	__UR : function(lm, data) {
		for ( var i = 0; i < data.length; i++) {
			var pl = data[i].polyline;
			for ( var j = 0; j < pl.length; j++) {
				/* Scaling adjustment. */
				pl[j].x = (pl[j].x * this.scl) / data[i].scale;
				pl[j].y = (pl[j].y * this.scl) / data[i].scale;

				/* Tileframe adjustment. */
				pl[j].x += this.ax;
				pl[j].y += this.ay;
			}
			var temp = new Region(data[i].id, data[i].label,
					data[i].description, data[i].resources, pl);
			lm.addAnnotationToLayer("regions", temp);
		}
	},

	/**
	 * Retrieves regions from the annotation server.
	 * 
	 * This method uses Dojo.xhr Ajax interface for retrieving annotations which
	 * are regions. Only those regions which fall inside a bounding box is
	 * retrieved. The bounding box is specified by its top-left (xl, yl) and
	 * bottom-right (xh, yh) coordinates. We assume that the origin is at the
	 * top-left corner of the Dojo surface.
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
	_GR : function(lid, xl, yl, xh, yh, sl, sh) {
		dojo.xhrGet( {
			url : "gr.php?lid=" + lid + "&x_low=" + xl + "&x_high=" + xh
					+ "&y_low=" + yl + "&y_high=" + yh + "&scale_low=" + 0
					+ "&scale_high=" + 8 + "&format=json",
			handleAs : "json",
			timeout : 5000, /* Time in milliseconds. */
			sync : true,
			load : function(response) {
				if ($defined(response)) {
					if (response.success) {
						if ($defined(response.regions)) {
							try {
								this.__UR(this.lm, response.regions);
							} catch (e) {
								console.error("engine._GR: " + e.name + " - "
										+ e.description);
							}
						}
					}
				}
			}.bind(this),
			error : function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
				return response;
			}
		});
	},

	/**
	 * Is the supplied point close to the start of the region polyline? If this
	 * returns true, the polyline will be closed to form a polygon.
	 * 
	 * @param {Integer}
	 *            x Current x-coordinate.
	 * @param {Integer}
	 *            y Current y-coordinate.
	 */
	__ICF : function(x, y) {
		if (this.rp.length > 1 && this.rp[0].x - 6 < x && this.rp[0].x + 6 > x
				&& this.rp[0].y - 6 < y && this.rp[0].y + 6 > y)
			return true;
		else
			return false;
	},

	/**
	 * Returns the current coordinate of the mouse pointer.
	 */
	__xy : function(e) {
		/* Get screen coordinates. */
		var x = e.clientX - this.dim.x;
		var y = e.clientY - this.dim.y;

		/* Tileframe adjustment (makes this relative to model). */
		return {
			sx : x,
			sy : y,
			rx : x - this.ax,
			ry : y - this.ay
		};
	},

	/**
	 * Checks if the user clicked inside the embryo image.
	 * 
	 * @param {Object}
	 *            xy Contains the screen coordinates.
	 */
	__isIn : function(p) {
		var w = woolz.tileframe.tileFrameContainer.offsetWidth;
		var h = woolz.tileframe.tileFrameContainer.offsetHeight;
		return (p.rx >= 0 && p.ry >= 0 && p.rx < w && p.ry < h);
	},

	/**
	 * Draws the creative canvas.
	 */
	__DC : function(t) {
		var a = this.surface.createGroup();
		a.description = "Creative Canvas: " + t;
		var b = this.surface.getDimensions();
		var c = a.createRect( {
			x : 0,
			y : 0,
			height : b.height,
			width : b.width
		});
		/* TODO: Change colors. */
		c.setFill( [ 0, 0, 100, 0.5 ]);
		c.setStroke( {
			color : "blue",
			width : 0
		});
		dojo.style(c.getNode(), "cursor", "crosshair");
		var cl = a.createText( {
			x : 5,
			y : 15,
			text : a.description
		});

		/* TODO: Better to put this separately. */
		cl.setFont( {
			family : "Arial",
			size : "9pt",
			style : "regular",
			weight : "bold"
		});
		cl.setFill("#ffffff");
		return {
			g : a,
			d : c.getNode()
		};
	},

	/**
	 * Activates the create canvas (for marker annotation) overlay over the
	 * target canvas.
	 * 
	 * Existing markers and regions that are displayed on the target canvas will
	 * be inactive but visible through a translucent veil. This helps the user
	 * to see what is already marked so that clutter is reduced.
	 */
	_ACM : function() {
		var t = this.__DC('Marker');
		this.evs.push(dojo.connect(t.d, "onclick", function(e) {
			var xy = this.__xy(e);
			if (this.__isIn(xy)) {
				ngembryo.dialogManager.createMarker(xy.rx, xy.ry, this.scl,
						ngembryo.lid);
			}
		}.bind(this)));
	},

	/**
	 * Creates a region by connecting polyline points.
	 * 
	 * @param {Object}
	 *            g Surface group for displaying region.
	 * @param {Integer}
	 *            sx x-screen coordinate of the polyline point.
	 * @param {Integer}
	 *            sy y-screen coordinate of the polyline point.
	 * @param {Integer}
	 *            rx x-coordinate of the polyline point.
	 * @param {Integer}
	 *            ry y-coordinate of the polyline point.
	 */
	__CR : function(g, sx, sy, rx, ry) {
		/*
		 * Is the the screen coordinate. All screen related functionalities
		 * (measurement, polyline creation etc.) are carried out using screen
		 * coordinates.
		 */
		var t = {
			x : sx,
			y : sy
		};
		this.rp.push(t);

		/*
		 * This is the coordinate relative to the tileframe where the model has
		 * been displayed. All annotations are created using this coordinate.
		 */
		var q = {
			x : rx,
			y : ry
		};
		this._rp.push(q);

		/* Check if this is the final connection. */
		if (this.__ICF(sx, sy)) {
			/* Display the finished region. */
			g.clear();
			var a = g.createPolyline(this.rp);
			a.setStroke( {
				color : "white",
				width : 2
			});
			a.setFill( [ 255, 255, 0, 0.25 ]);

			/*
			 * Open the region creation dialog box for adding details to the
			 * region annotation.
			 */
			ngembryo.dialogManager.createRegion(this._rp, this.scl,
					ngembryo.lid);

			/* Clear array for the next region. */
			this.rp = [];
			this._rp = [];
		}
	},

	/**
	 * Draw the finishing circle, which is the last point added to the polyline.
	 * 
	 * @param {Object}
	 *            g Dojo surface group.
	 * @param {Boolean}
	 *            flag Should we display measurements.
	 */
	__Dfin : function(g, flag) {
		this.rp.pop();
		var c = g.createCircle( {
			cx : this.rp[0].x,
			cy : this.rp[0].y,
			r : 5
		});
		c.setFill( [ 255, 255, 255, 1 ]);
		c.setStroke("blue");
		this.evsl.push(dojo.connect(c.getNode(), "onclick", function(e) {
			/*
			 * Since clicking on the circle means that the user want to conclude
			 * creating the region by closing the polyline, we ignore the
			 * current mouse, and pass the coordinates of the first point
			 * instead.
			 */
			if (flag) {
				this.__m(g, this.rp[0].x, this.rp[0].y, this._rp[0].x,
						this._rp[0].y);
			} else {
				this.__CR(g, this.rp[0].x, this.rp[0].y, this._rp[0].x,
						this._rp[0].y);
			}
			dojo.forEach(this.evsl, dojo.disconnect);
		}.bind(this)));

		this.evsl.push(dojo.connect(c.getNode(), "onmouseenter", function(e) {
			c.setFill( [ 0, 255, 0, 1 ]);
		}));

		this.evsl.push(dojo.connect(c.getNode(), "onmouseleave", function(e) {
			c.setFill( [ 255, 255, 255, 1 ]);
		}));
	},

	/**
	 * Record mouse movement while over canvas.
	 */
	__rmm : function(e) {
		var x = e.clientX - this.dim.x;
		var y = e.clientY - this.dim.y;

		/**
		 * When the mouse pointer moves around the canvas, a line is drawn
		 * dynamically by joining the current mouse pointer position to the last
		 * point in the existing region polyline. Since the mouse onclick event
		 * is associated with the create canvas, we should not draw this dynamic
		 * line exactly using the current position of the mouse pointer. If this
		 * is not adjusted the mouse click event will never be triggered, since
		 * the onclick mouse event will be associated with the dynamic line. We
		 * therefore adjust the moving end of the line to not cover the create
		 * canvas.
		 */
		var px = x;
		var py = y;
		var p = this.rp;
		var l = this.rp.length - 1;
		if (p[l].x <= px)
			px--;
		else
			px++;
		if (p[l].y <= py)
			py--;
		else
			py++;

		if (this.__ICF(px, py)) {
			px = this.rp[0].x;
			py = this.rp[0].y;
		}
		var t = {
			x : px,
			y : py
		};

		this.rp.push(t);
		if (this.rp.length > 0) {
			dojo.forEach(this.evsl, dojo.disconnect);
			this.evsl = [];
		}
	},

	/**
	 * Draws the temporary polyline.
	 * 
	 * @param {Object}
	 *            g Dojo surface group.
	 * @param {Object}
	 *            e Mouse vent.
	 */
	__Dtp : function(g, e) {
		this.__rmm(e);
		g.clear();
		var a = g.createPolyline(this.rp);
		a.setStroke( {
			color : "yellow"
		});
	},

	/**
	 * Activates the create canvas (for region annotation) overlay over the
	 * target canvas.
	 * 
	 * Existing markers and regions that are displayed on the target canvas will
	 * be inactive but visible through a translucent veil. This helps the user
	 * to see what is already marked so that clutter is reduced.
	 */
	_ACR : function() {
		this.rp = [];
		this._rp = [];
		var t = this.__DC('Region');
		var q = this.surface.createGroup();
		this.evs.push(dojo.connect(t.d, "onclick", function(e) {
			var xy = this.__xy(e);
			if (this.__isIn(xy)) {
				this.__CR(q, xy.sx, xy.sy, xy.rx, xy.ry);
			}
		}.bind(this)));

		this.evs.push(dojo.connect(t.d, "onmousemove", function(e) {
			if (this.rp.length > 0) {
				this.__Dtp(q, e); /* Draw temporary polyline. */
				this.__Dfin(q, false); /* Draw finish circle. */
			}
		}.bind(this)));
	},

	/**
	 * Finds the centroid of a ploygon.
	 * 
	 * @param {Object}
	 *            p The polygon.
	 */
	__fPC : function(p) {
		var k = p.length;
		var tx = 0, ty = 0, c = new Array(2);
		for ( var i = 0; i < k; i++) {
			tx += p[i].x;
			ty += p[i].y;
		}
		c[0] = tx / k;
		c[1] = ty / k;
		return c;
	},

	/**
	 * TODO: Finds the area of a 3D planar polygon. Algorithm from:
	 * http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm
	 */
	/**
	 * Finds the area of a polygon.
	 * 
	 * Uses algorithm by Darel Rex Finley.
	 * http://alienryderflex.com/polygon_area/
	 * 
	 * @param {Object}
	 *            p The polygon.
	 */
	__fAP : function(p) {
		var a = 0.0;
		var k = p.length;
		for ( var i = 0, j = 0; i < k; i++) {
			j++;
			if (j == k)
				j = 0;
			a += (p[i].x + p[j].x) * (p[i].y - p[j].y);
		}

		/*
		 * We return the absolute value because the area of the polygon is
		 * positive when the polygon is counter-clockwise; negative if
		 * clockwise. The area remains the same (except for the sign).
		 */
		return Math.abs(a * 0.5);
	},

	/**
	 * Draw polyline with the segment lengths and area (if polygon).
	 * 
	 * @param {Object}
	 *            g Dojo surface group.
	 * @param {Object}
	 *            p Is this a polygon.
	 * @param {Object}
	 *            e Mouse event.
	 */
	__Dpm : function(g, p, e) {
		if ($defined(e))
			this.__rmm(e);
		g.clear();
		var a = g.createPolyline(this.rp);
		if (p) {
			a.setFill( [ 0, 0, 100, 0.8 ]);
			border = "blue";
		}
		a.setStroke( {
			color : "blue",
			width : 2
		});

		/*
		 * For each of the line segments, find take the measurements.
		 */
		var segments = new Array();
		var x, y, xd, yd, d, p1x, p1y, p2x, p2y, t;
		t = this._rp.length - 1;
		this.cir = 0;
		for ( var i = 0; i < t; i++) {
			p1x = this.rp[i].x;
			p2x = this.rp[i + 1].x;
			p1y = this.rp[i].y;
			p2y = this.rp[i + 1].y;

			/* Find the mid point of the line segment. */
			x = (p1x + p2x) / 2;
			y = (p1y + p2y) / 2;

			/* Length of the line segment (on screen). */
			xd = p2x - p1x;
			yd = p2y - p1y;
			d = Math.round(Math.sqrt(xd * xd + yd * yd));
			this.cir += d;

			/* Display the length at the midpoint. */
			var cl = g.createText( {
				x : x + 5, /* Displace by 5 pixels. */
				y : y,
				text : d
			});
			cl.setFont( {
				family : "Arial",
				size : "9pt",
				style : "regular",
				weight : "bold"
			});
			cl.setFill("#ffffff");
		}
		segments = null;
	},

	/**
	 * Creates a region by connecting polyline points.
	 * 
	 * @param {Object}
	 *            g Surface group for displaying region.
	 * @param {Integer}
	 *            sx x-screen coordinate of the polyline point.
	 * @param {Integer}
	 *            sy y-screen coordinate of the polyline point.
	 * @param {Integer}
	 *            rx x-coordinate of the polyline point.
	 * @param {Integer}
	 *            ry y-coordinate of the polyline point.
	 */
	__m : function(g, sx, sy, rx, ry) {
		var t = {
			x : sx,
			y : sy
		};
		this.rp.push(t);
		var q = {
			x : rx,
			y : ry
		};
		this._rp.push(q);

		/*
		 * Get the 3D woolz coordinate of this point. TODO: This will be used to
		 * calculate the actual coordinates in 3D, and then to calculate the
		 * area dn circumference in 3D.
		 */
		/*
		 * woolz.model.getWlzCoordinate(x, y, function(response){
		 * this.actual3Dcoord = response.split(" "); });
		 */
		/* Check if this is the final connection. */
		if (this.rp.length > 2 && this.__ICF(sx, sy)) {

			/* Get the measurements. */
			this.__Dpm(g, true, null);

			/* Display polygon area and circumference. */
			var c = this.__fPC(this.rp);
			var a = this.__fAP(this.rp);
			var cl = g.createText( {
				x : c[0] - 15, /* Adjust for label "Area:". */
				y : c[1] - 7, /* Adjust for multiline. */
				text : "Area: " + a
			});
			cl.setFont( {
				family : "Arial",
				size : "9pt",
				style : "regular",
				weight : "bold"
			});
			cl.setFill("#ffff00");

			cl = g.createText( {
				x : c[0] - 15, /* Adjust for label "Circ:". */
				y : c[1] + 7, /* Adjust for multiline. */
				text : "Circ: " + this.cir
			});
			cl.setFont( {
				family : "Arial",
				size : "9pt",
				style : "regular",
				weight : "bold"
			});
			cl.setFill("#ffff00");

			/* Clear arrays for the next region. */
			this.rp = [];
			this._rp = [];
			this.cir = 0;
		}
	},

	/**
	 * Activates the create canvas (for region annotation) overlay over the
	 * target canvas.
	 * 
	 * Existing markers and regions that are displayed on the target canvas will
	 * be inactive but visible through a translucent veil. This helps the user
	 * to see what is already marked so that clutter is reduced.
	 */
	_AMC : function() {
		this.rp = [];
		this._rp = [];
		var t = this.__DC('Measure');
		var q = this.surface.createGroup();
		this.evs.push(dojo.connect(t.d, "onclick", function(e) {
			var xy = this.__xy(e);
			if (this.__isIn(xy)) {
				this.__m(q, xy.sx, xy.sy, xy.rx, xy.ry);
			}
		}.bind(this)));

		this.evs.push(dojo.connect(t.d, "onmousemove", function(e) {
			if (this.rp.length > 0) {
				/* Draw polyline with measures. */
				this.__Dpm(q, false, e);

				/* Draw finish circle. */
				this.__Dfin(q, true);
			}
		}.bind(this)));
	}
});