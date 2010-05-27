/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh
 * Funded by the JISC (http:// www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */
/**
 * @classDescription This class encapsulates the web application toolbar.
 */
var Toolbar = new Class( {
	/**
	 * Initialises the toolbar.
	 * 
	 * @param {Object}
	 *            app Application to attach the toolbar to.
	 * @param {Object}
	 *            engine Annotation Engine.
	 * @param {Object}
	 *            model list of models.
	 */
	initialize : function(app, engine, models) {
		var t = new Array();

		/* Toolbar is displayed on the top of the web-application. */
		var toolbar = new dijit.Toolbar( {
			region : "top",
			style : "height:25px;"
		});
		app.addChild(toolbar);

		/* A drop-down button is used to select an embryo model. */
		var menu = new dijit.Menu( {
			style : "display: none;"
		});
		var menuitem = new Array();
		for ( var i = 0; i < models.item.length; i++) {
			menuitem[i] = models.item[i].title;
		}
		for ( var i = 0; i < menuitem.length; i++) {
			var temp = new dijit.MenuItem( {
				id : "modelMenuItem" + i,
				index : i,
				label : menuitem[i],
				onClick : function() {
					models.createEmbryoModel(this.index);
				}
			});
			menu.addChild(temp);
		}

		/* Displays the selection menu on the toolbar. */
		var selectEmbryo = new dijit.form.DropDownButton( {
			label : "Embryo",
			name : "selectEmbryo",
			dropDown : menu,
			id : "selectEmbryo",
			style : "float:left;"
		});
		toolbar.addChild(selectEmbryo);
		t.push("selectEmbryo");

		/* Toggle buttons are used to control display or hiding of annotations. */
		var toggleMarkers = new dijit.form.ToggleButton( {
			id : "toggleMarkers",
			label : "Markers",
			checked : engine.isMarkerVisible(),
			iconClass : "dijitCheckBoxIcon",
			style : "float:left;",
			onClick : function() {
				ngembryo.engine.toggleMarkerVisibility();
			}
		});
		toolbar.addChild(toggleMarkers);
		t.push("toggleMarkers");

		var toggleRegions = new dijit.form.ToggleButton( {
			id : "toggleRegions",
			label : "Regions",
			checked : engine.isRegionVisible(),
			iconClass : "dijitCheckBoxIcon",
			style : "float:left;",
			onClick : function() {
				ngembryo.engine.toggleRegionVisibility();
			}
		});
		toolbar.addChild(toggleRegions);
		t.push("toggleRegions");

		var toggleControls = new dijit.form.ToggleButton( {
			id : "toggleControls",
			label : "Controls",
			checked : engine.isControlsActive(),
			iconClass : "dijitCheckBoxIcon",
			style : "float:left;",
			onClick : function() {
				var h = dojo.style('content', 'height');
				var t = dojo.style('toggleControls', 'height') + 2;
				if (ngembryo.engine.isControlsActive()) {
					ngembryo.engine.hideControls();
					ngembryo.engine.deactivateControls();
				} else {
					ngembryo.engine.activateControls();
					ngembryo.engine.showControls();
				}
			}
		});
		toolbar.addChild(toggleControls);
		t.push("toggleControls");

		var createMarker = new dijit.form.ToggleButton( {
			id : "createMarker",
			label : "marker",
			showLabel : "true",
			iconClass : "addMarker",
			style : "float:left;",
			onClick : function() {
				if (this.attr('checked')) {
					var t = ngembryo.engine
							.showCreateCanvas(ngembryo.engine.ccte.m);
					if (!t) {
						this.attr('checked', false);
					}
				} else {
					ngembryo.engine.hideCreateCanvas();
				}
			}
		});
		toolbar.addChild(createMarker);
		t.push("createMarker");

		var createRegion = new dijit.form.ToggleButton( {
			id : "createRegion",
			label : "region",
			showLabel : "true",
			iconClass : "addRegion",
			style : "float:left;",
			onClick : function() {
				if (this.attr('checked')) {
					var t = ngembryo.engine
							.showCreateCanvas(ngembryo.engine.ccte.r);
					if (!t) {
						this.attr('checked', false);
					}
				} else {
					ngembryo.engine.hideCreateCanvas();
				}
			}
		});
		toolbar.addChild(createRegion);
		t.push("createRegion");

		var takeMeasurement = new dijit.form.ToggleButton( {
			id : "takeMeasurement",
			label : "Measure",
			showLabel : "true",
			iconClass : "measure",
			style : "float:left;",
			onClick : function() {
				if (this.attr('checked')) {
					var t = ngembryo.engine
							.showCreateCanvas(ngembryo.engine.ccte.s);
					if (!t) {
						this.attr('checked', false);
					}
				} else {
					ngembryo.engine.hideCreateCanvas();
				}
			}
		});
		toolbar.addChild(takeMeasurement);
		t.push("takeMeasurement");

		/* A drop-down orientation menu. */
		var orientationMenu = new dijit.Menu( {
			style : "display: none;"
		});
		var selectOrientation = new dijit.MenuItem( {
			id : "selectOrientationMenuItem",
			index : 1,
			label : "Select",
			onClick : function() {
				ngembryo.orientation.display();
			}
		});
		orientationMenu.addChild(selectOrientation);
		var createOrientation = new dijit.MenuItem( {
			id : "createOrientationMenuItem",
			index : 2,
			label : "Create",
			onClick : function() {
				ngembryo.orientation.create(false);
			}
		});
		orientationMenu.addChild(createOrientation);
		var orientationDropDown = new dijit.form.DropDownButton( {
			label : "Orientation",
			name : "orientationDropDown",
			dropDown : orientationMenu,
			id : "orientationDropDown",
			style : "float:left;"
		});
		toolbar.addChild(orientationDropDown);
		t.push("orientationDropDown");

		/* A drop-down layer menu. */
		var layerMenu = new dijit.Menu( {
			style : "display: none;"
		});
		var selectLayer = new dijit.MenuItem( {
			id : "selectLayerMenuItem",
			index : 1,
			label : "Select",
			onClick : function() {
				ngembryo.layer.display();
			}
		});
		layerMenu.addChild(selectLayer);
		var createLayer = new dijit.MenuItem( {
			id : "createLayerMenuItem",
			index : 2,
			label : "Create",
			onClick : function() {
				ngembryo.layer.create(false);
			}
		});
		layerMenu.addChild(createLayer);
		var layerDropDown = new dijit.form.DropDownButton( {
			label : "Layer",
			name : "layerDropDown",
			dropDown : layerMenu,
			id : "layerDropDown",
			style : "float:left;"
		});
		toolbar.addChild(layerDropDown);
		t.push("layerDropDown");

		/* A drop-down resource menu. */
		var resourceMenu = new dijit.Menu( {
			style : "display: none;"
		});
		var displayResource = new dijit.MenuItem( {
			id : "displayResourceMenuItem",
			index : 1,
			label : "Display",
			onClick : function() {
				ngembryo.resource.list();
			}
		});
		resourceMenu.addChild(displayResource);
		var createResource = new dijit.MenuItem( {
			id : "createResourceMenuItem",
			index : 1,
			label : "Create",
			onClick : function() {
				ngembryo.resource.create(false);
			}
		});
		resourceMenu.addChild(createResource);
		var resourceDropDown = new dijit.form.DropDownButton( {
			label : "Resource",
			name : "resourceDropDown",
			dropDown : resourceMenu,
			id : "resourceDropDown",
			style : "float:left;"
		});
		toolbar.addChild(resourceDropDown);
		t.push("resourceDropDown");

		var search = new dijit.form.Button( {
			id : "search",
			label : "Search",
			showLabel : "true",
			iconClass : "search",
			style : "float:left;",
			onClick : function() {
				ngembryo.engine.search();
			}
		});
		toolbar.addChild(search);
		t.push("search");

		/* About and Help buttons. */
		var aboutButton = new dijit.form.Button( {
			id : "about",
			label : "About",
			style : "float:right;",
			onClick : function() {
				ngembryo.dialogManager.showAbout();
			}
		});
		toolbar.addChild(aboutButton);
		t.push("about");
		var helpButton = new dijit.form.Button( {
			id : "help",
			label : "Help",
			style : "float:right;",
			onClick : function() {
				ngembryo.dialogManager.showHelp();
			}
		});
		toolbar.addChild(helpButton);
		t.push("help");
		this.tb = t;
		this.toolbar = toolbar;
		this.toggleToolbarActionItems(false);
	},

	/**
	 * Destroys the toolbar.
	 */
	destroy : function() {
		if ($defined(this.tb) && $defined(this.toolbar)) {
			var items = this.tb;
			var t = this.toolbar;
			for ( var i = 0; i < items.length; i++) {
				var x = dijit.byId(items[i]);
				t.removeChild(x);
				x.destroyRecursive();
				console.info(items[i]);
			}
		}
	},

	/**
	 * Display or Hide toolbar items.
	 * 
	 * @param flag
	 *            Flag is true if the toolbar items should be displayed.
	 */
	toggleToolbarActionItems : function(flag) {
		if ($defined(this.tb) && $defined(this.toolbar)) {
			for ( var i = 0; i < this.tb.length; i++) {
				if (this.tb[i] != "selectEmbryo" && this.tb[i] != "help"
						&& this.tb[i] != "about") {
					dojo.style(dijit.byId(this.tb[i]).domNode, 'display',
							flag ? 'block' : 'none');
				}
			}
		}
	},

	/*
	 * Disables all of the toolbar items except for the supplied.
	 */
	disable : function(except) {
		for ( var i = 0; i < this.tb.length; i++) {
			if (this.tb[i] != except) {
				dijit.byId(this.tb[i]).attr( {
					disabled : true
				});
			}
		}
	},

	/*
	 * Enables all of the toolbar items except for the supplied.
	 */
	enable : function(except) {
		for ( var i = 0; i < this.tb.length; i++) {
			if (this.tb[i] != except) {
				dijit.byId(this.tb[i]).attr( {
					disabled : false
				});
			}
		}
	}
});
