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
 * 
 * This initialises the application toolbar and buttons.
 */
var Toolbar = new Class( {
	/**
	 * @classDescription Initialises the toolbar.
	 * @param {Object}
	 *            app Application to attach the toolbar to.
	 */
	initialize : function(app, engine, models) {
		// Toolbar is displayed on the top of the web-application.
		var toolbar = new dijit.Toolbar( {
			region : "top",
			style : "height:25px;"
		});
		app.addChild(toolbar);

		// A drop-down button is used to select an embryo model.
		var menu = new dijit.Menu( {
			style : "display: none;"
		});
		var menuitem = new Array();
		for (var i = 0; i < models.item.length; i++) {
			menuitem[i] = models.item[i].title;
		}

		/**
		 * TODO: When an embryo is selected, a model for the embryo is created
		 * by invoking createEmbryoModel() method.
		 */
		for ( var i = 0; i < menuitem.length; i++) {
			var temp = new dijit.MenuItem( {
				id : "modelMenuItem" + i,
				index: i,
				label : menuitem[i],
				onClick : function() {
					models.createEmbryoModel(this.index);
				}
			});
			menu.addChild(temp);
		}

		// Displays the selection menu on the toolbar.
		var selectEmbryo = new dijit.form.DropDownButton( {
			label : "Embryo",
			name : "selectEmbryo",
			dropDown : menu,
			id : "selectEmbryo",
			style : "float:left;"
		});
		toolbar.addChild(selectEmbryo);

		// Toggle buttons are used to control interactive display or hiding of
		// annotations.
		var toggle2DMarkers = new dijit.form.ToggleButton( {
			id : "toggle2DMarkers",
			label : "Markers",
			checked : engine.isMarker2DVisible(),
			iconClass : "dijitCheckBoxIcon",
			style : "float:left;",
			onClick : function() {
				ngembryo.engine.toggleMarker2DVisibility();
			}
		});
		toolbar.addChild(toggle2DMarkers);

		var toggle2DRegions = new dijit.form.ToggleButton( {
			id : "toggle2DRegions",
			label : "Regions",
			checked : engine.isRegion2DVisible(),
			iconClass : "dijitCheckBoxIcon",
			style : "float:left;",
			onClick : function() {
				ngembryo.engine.toggleRegion2DVisibility();
			}
		});
		toolbar.addChild(toggle2DRegions);

		var create2DMarker = new dijit.form.ToggleButton( {
			id : "create2DMarker",
			label : "2Dmarker",
			showLabel : "true",
			iconClass : "addMarker2D",
			style : "float:left;",
			onClick : function() {
				if (this.attr('checked')) {
					ngembryo.engine
							.showCreateCanvas(ngembryo.engine.ccTypeEnum.c2dm);
					dojo.style("controls", {
						display : "none"
					});

					dijit.byId("selectEmbryo").attr( {
						disabled : true
					});
					dijit.byId("toggle2DMarkers").attr( {
						disabled : true
					});
					dijit.byId("toggle2DRegions").attr( {
						disabled : true
					});
					dijit.byId("create2DRegion").attr( {
						disabled : true
					});
					dijit.byId("takeMeasurement").attr( {
						disabled : true
					});
				} else {
					ngembryo.engine.hideCreateCanvas();

					dojo.style("controls", {
						display : "block"
					});

					dijit.byId("selectEmbryo").attr( {
						disabled : false
					});
					dijit.byId("toggle2DMarkers").attr( {
						disabled : false
					});
					dijit.byId("toggle2DRegions").attr( {
						disabled : false
					});
					dijit.byId("create2DRegion").attr( {
						disabled : false
					});
					dijit.byId("takeMeasurement").attr( {
						disabled : false
					});
				}
				ngembryo.engine.refresh();
			}
		});
		toolbar.addChild(create2DMarker);

		var create2DRegion = new dijit.form.ToggleButton( {
			id : "create2DRegion",
			label : "2Dregion",
			showLabel : "true",
			iconClass : "addRegion2D",
			style : "float:left;",
			onClick : function() {
				if (this.attr('checked')) {
					ngembryo.engine
							.showCreateCanvas(ngembryo.engine.ccTypeEnum.c2dr);
					dojo.style("controls", {
						display : "none"
					});
					dijit.byId("selectEmbryo").attr( {
						disabled : true
					});
					dijit.byId("toggle2DMarkers").attr( {
						disabled : true
					});
					dijit.byId("toggle2DRegions").attr( {
						disabled : true
					});
					dijit.byId("create2DMarker").attr( {
						disabled : true
					});
					dijit.byId("takeMeasurement").attr( {
						disabled : true
					});
				} else {
					ngembryo.engine.hideCreateCanvas();
					dojo.style("controls", {
						display : "block"
					});

					dijit.byId("selectEmbryo").attr( {
						disabled : false
					});
					dijit.byId("toggle2DMarkers").attr( {
						disabled : false
					});
					dijit.byId("toggle2DRegions").attr( {
						disabled : false
					});
					dijit.byId("create2DMarker").attr( {
						disabled : false
					});
					dijit.byId("takeMeasurement").attr( {
						disabled : false
					});
				}
				ngembryo.engine.refresh();
			}
		});
		toolbar.addChild(create2DRegion);

		var takeMeasurement = new dijit.form.ToggleButton( {
			id : "takeMeasurement",
			label : "Measure",
			showLabel : "true",
			iconClass : "measure",
			style : "float:left;",
			onClick : function() {
				if (this.attr('checked')) {
					ngembryo.engine
							.showCreateCanvas(ngembryo.engine.ccTypeEnum.mesr);
					dojo.style("controls", {
						display : "none"
					});
					dijit.byId("selectEmbryo").attr( {
						disabled : true
					});
					dijit.byId("toggle2DMarkers").attr( {
						disabled : true
					});
					dijit.byId("toggle2DRegions").attr( {
						disabled : true
					});
					dijit.byId("create2DMarker").attr( {
						disabled : true
					});
					dijit.byId("create2DRegion").attr( {
						disabled : true
					});
				} else {
					ngembryo.engine.hideCreateCanvas();
					dojo.style("controls", {
						display : "block"
					});
					dijit.byId("selectEmbryo").attr( {
						disabled : false
					});
					dijit.byId("toggle2DMarkers").attr( {
						disabled : false
					});
					dijit.byId("toggle2DRegions").attr( {
						disabled : false
					});
					dijit.byId("create2DMarker").attr( {
						disabled : false
					});
					dijit.byId("create2DRegion").attr( {
						disabled : false
					});
				}
				ngembryo.engine.refresh();
			}
		});
		toolbar.addChild(takeMeasurement);

		// About and Help buttons.
		var aboutButton = new dijit.form.Button( {
			id : "about",
			label : "About",
			style : "float:right;",
			onClick : function() {
				ngembryo.dialogManager.showAbout();
			}
		});
		toolbar.addChild(aboutButton);

		var helpButton = new dijit.form.Button( {
			id : "help",
			label : "Help",
			style : "float:right;",
			onClick : function() {
				ngembryo.dialogManager.showHelp();
			}
		});
		toolbar.addChild(helpButton);
	}
});
