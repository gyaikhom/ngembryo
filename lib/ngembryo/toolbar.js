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
var Toolbar = new Class({
    /**
     * @classDescription Initialises the toolbar.
     * @param {Object}
     *            app Application to attach the toolbar to.
     */
    initialize: function(app, engine){
        // Toolbar is displayed on the top of the web-application.
        var toolbar = new dijit.Toolbar({
            region: "top",
            style: "height:25px;"
        });
        app.addChild(toolbar);
        
        // A drop-down button is used to select an embryo model.
        var menu = new dijit.Menu({
            style: "display: none;"
        });
        var menuitem = new Array();
        menuitem[0] = "Single TS19 image";
        menuitem[1] = "TS19 stack";
        menuitem[2] = "Overlays";
        menuitem[3] = "Woolz";
        menuitem[4] = "Kidney x6";
        menuitem[5] = "Kidney full";
        menuitem[6] = "NeuroTerrain full";
        menuitem[7] = "NeuroTerrain thresholded";
        menuitem[8] = "Visible Male Colour";
        menuitem[9] = "Visible Male test";
        menuitem[10] = "Eurexpress Data";
        menuitem[11] = "Longrun";
        menuitem[12] = "EurExpress test";
        menuitem[13] = "Overlayed Image";
        
        /**
         * TODO: When an embryo is selected, a model for the embryo is created
         * by invoking createEmbryoModel() method.
         */
        for (var i = 0; i < menuitem.length; i++) {
            var temp = new dijit.MenuItem({
                id: i,
                label: menuitem[i],
                onClick: function(){
                    // createEmbryoModel(this.id);
                    alert(this.id);
                }
            });
            menu.addChild(temp);
        }
        
        // Displays the selection menu on the toolbar.
        var selectEmbryo = new dijit.form.DropDownButton({
            label: "Embryo",
            name: "selectEmbryo",
            dropDown: menu,
            id: "selectEmbryo",
            style: "float:left;"
        });
        toolbar.addChild(selectEmbryo);
        
        // Toggle buttons are used to control interactive display or hiding of annotations.
        var toggle2DMarkers = new dijit.form.ToggleButton({
            id: "toggle2DMarkers",
            label: "Markers",
            checked: engine.isMarker2DVisible(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function(){
                ngembryo.engine.toggleMarker2DVisibility();
                if (this.attr('checked')) {
                    dijit.byId("toggle2DMarkerLabels").attr({
                        disabled: false
                    });
                }
                else {
                    dijit.byId("toggle2DMarkerLabels").attr({
                        disabled: true
                    });
                }
            }
        });
        toolbar.addChild(toggle2DMarkers);
        
        var toggle2DMarkerLabels = new dijit.form.ToggleButton({
            id: "toggle2DMarkerLabels",
            label: "Marker labels",
			checked: engine.isMarker2DLabelVisible(),
			iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function(){
                ngembryo.engine.toggleMarker2DLabelVisibility();
            }
        });
		console.info("kkk: " + engine.isMarker2DLabelVisible());
        toolbar.addChild(toggle2DMarkerLabels);
        
        var toggle2DRegions = new dijit.form.ToggleButton({
            id: "toggle2DRegions",
            label: "Regions",
            checked: engine.isRegion2DVisible(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function(){
                ngembryo.engine.toggleRegion2DVisibility();
                if (this.attr('checked')) {
                    dijit.byId("toggle2DRegionLabels").attr({
                        disabled: false
                    });
                }
                else {
                    dijit.byId("toggle2DRegionLabels").attr({
                        disabled: true
                    });
                }
            }
        });
        toolbar.addChild(toggle2DRegions);
        
        var toggle2DRegionLabels = new dijit.form.ToggleButton({
            id: "toggle2DRegionLabels",
            label: "Region labels",
			checked: engine.isRegion2DLabelVisible(),
            style: "float:left;",
            onClick: function(){
                ngembryo.engine.toggleRegion2DLabelVisibility();
            }
        });
        toolbar.addChild(toggle2DRegionLabels);
        
        var create2DMarker = new dijit.form.ToggleButton({
            id: "create2DMarker",
            label: "+ 2Dmarker",
            style: "float:left;",
            onClick: function(){
                if (this.attr('checked')) {
                    ngembryo.engine.showCreateCanvas(ngembryo.engine.ccTypeEnum.c2dm);
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkerLabels").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegionLabels").attr({
                        disabled: true
                    });
                    dijit.byId("create2DRegion").attr({
                        disabled: true
                    });
                    
                }
                else {
                    ngembryo.engine.hideCreateCanvas();
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkerLabels").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegionLabels").attr({
                        disabled: false
                    });
                    dijit.byId("create2DRegion").attr({
                        disabled: false
                    });
                }
                ngembryo.engine.refresh();
            }
        });
        toolbar.addChild(create2DMarker);
        
        var create2DRegion = new dijit.form.ToggleButton({
            id: "create2DRegion",
            label: "+ 2Dregion",
            style: "float:left;",
            onClick: function(){
                if (this.attr('checked')) {
                    ngembryo.engine.showCreateCanvas(ngembryo.engine.ccTypeEnum.c2dr);
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkerLabels").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegionLabels").attr({
                        disabled: true
                    });
                    dijit.byId("create2DMarker").attr({
                        disabled: true
                    });
                }
                else {
                    ngembryo.engine.hideCreateCanvas();
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkerLabels").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegionLabels").attr({
                        disabled: false
                    });
                    dijit.byId("create2DMarker").attr({
                        disabled: false
                    });
                    
                }
                ngembryo.engine.refresh();
            }
        });
        toolbar.addChild(create2DRegion);
        
        // About and Help buttons.
        var aboutButton = new dijit.form.Button({
            id: "about",
            label: "About",
            style: "float:right;",
            onClick: function(){
                ngembryo.dialogManager.showAbout();
            }
        });
        toolbar.addChild(aboutButton);
        
        var helpButton = new dijit.form.Button({
            id: "help",
            label: "Help",
            style: "float:right;",
            onClick: function(){
                ngembryo.dialogManager.showHelp();
            }
        });
        toolbar.addChild(helpButton);
        
        // The content panel displays the actual images and annotations.
        var content = new dijit.layout.ContentPane({
            region: "center",
            id: "content",
            style: "padding: 0px; border: 0px;"
        });
        app.addChild(content);
        
        // Since we require a target DOM element in order to create the Dojo
        // canvas and the tile-frames (for displaying the embryo image), we
        // create a simple <div> element, and attach this to the content panel.
        var target = dojo.create("div", {
            id: "targetframe",
            style: "background: #ffffff; height: 100%; overflow: hidden;"
        }, content.domNode);
    }
});
