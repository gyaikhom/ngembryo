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
    initialize: function(app, engine, models){
        /* Toolbar is displayed on the top of the web-application. */
        var toolbar = new dijit.Toolbar({
            region: "top",
            style: "height:25px;"
        });
        app.addChild(toolbar);
        
        /* A drop-down button is used to select an embryo model. */
        var menu = new dijit.Menu({
            style: "display: none;"
        });
        var menuitem = new Array();
        for (var i = 0; i < models.item.length; i++) {
            menuitem[i] = models.item[i].title;
        }
        for (var i = 0; i < menuitem.length; i++) {
            var temp = new dijit.MenuItem({
                id: "modelMenuItem" + i,
                index: i,
                label: menuitem[i],
                onClick: function(){
                    models.createEmbryoModel(this.index);
                }
            });
            menu.addChild(temp);
        }
        
        /* Displays the selection menu on the toolbar. */
        var selectEmbryo = new dijit.form.DropDownButton({
            label: "Embryo",
            name: "selectEmbryo",
            dropDown: menu,
            id: "selectEmbryo",
            style: "float:left;"
        });
        toolbar.addChild(selectEmbryo);
        
        /* Toggle buttons are used to control display or hiding of annotations. */
        var toggle2DMarkers = new dijit.form.ToggleButton({
            id: "toggle2DMarkers",
            label: "Markers",
            checked: engine.isMarker2DVisible(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function(){
                ngembryo.engine.toggleMarker2DVisibility();
            }
        });
        toolbar.addChild(toggle2DMarkers);
        var toggle2DRegions = new dijit.form.ToggleButton({
            id: "toggle2DRegions",
            label: "Regions",
            checked: engine.isRegion2DVisible(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function(){
                ngembryo.engine.toggleRegion2DVisibility();
            }
        });
        toolbar.addChild(toggle2DRegions);
        
        var create2DMarker = new dijit.form.ToggleButton({
            id: "create2DMarker",
            label: "2Dmarker",
            showLabel: "true",
            iconClass: "addMarker2D",
            style: "float:left;",
            onClick: function(){
                if (this.attr('checked')) {
                    ngembryo.engine.showCreateCanvas(ngembryo.engine.ccTypeEnum.c2dm);
                    dojo.style("controls", {
                        display: "none"
                    });
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: true
                    });
                    dijit.byId("create2DRegion").attr({
                        disabled: true
                    });
                    dijit.byId("takeMeasurement").attr({
                        disabled: true
                    });
                }
                else {
                    ngembryo.engine.hideCreateCanvas();
                    
                    dojo.style("controls", {
                        display: "block"
                    });
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: false
                    });
                    dijit.byId("create2DRegion").attr({
                        disabled: false
                    });
                    dijit.byId("takeMeasurement").attr({
                        disabled: false
                    });
                }
                ngembryo.engine.refresh();
            }
        });
        toolbar.addChild(create2DMarker);
        
        var create2DRegion = new dijit.form.ToggleButton({
            id: "create2DRegion",
            label: "2Dregion",
            showLabel: "true",
            iconClass: "addRegion2D",
            style: "float:left;",
            onClick: function(){
                if (this.attr('checked')) {
                    ngembryo.engine.showCreateCanvas(ngembryo.engine.ccTypeEnum.c2dr);
                    dojo.style("controls", {
                        display: "none"
                    });
                    dijit.byId("selectEmbryo").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: true
                    });
                    dijit.byId("create2DMarker").attr({
                        disabled: true
                    });
                    dijit.byId("takeMeasurement").attr({
                        disabled: true
                    });
                }
                else {
                    ngembryo.engine.hideCreateCanvas();
                    dojo.style("controls", {
                        display: "block"
                    });
                    
                    dijit.byId("selectEmbryo").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: false
                    });
                    dijit.byId("create2DMarker").attr({
                        disabled: false
                    });
                    dijit.byId("takeMeasurement").attr({
                        disabled: false
                    });
                }
                ngembryo.engine.refresh();
            }
        });
        toolbar.addChild(create2DRegion);
        
        var takeMeasurement = new dijit.form.ToggleButton({
            id: "takeMeasurement",
            label: "Measure",
            showLabel: "true",
            iconClass: "measure",
            style: "float:left;",
            onClick: function(){
                if (this.attr('checked')) {
                    ngembryo.engine.showCreateCanvas(ngembryo.engine.ccTypeEnum.mesr);
                    dojo.style("controls", {
                        display: "none"
                    });
                    dijit.byId("selectEmbryo").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: true
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: true
                    });
                    dijit.byId("create2DMarker").attr({
                        disabled: true
                    });
                    dijit.byId("create2DRegion").attr({
                        disabled: true
                    });
                }
                else {
                    ngembryo.engine.hideCreateCanvas();
                    dojo.style("controls", {
                        display: "block"
                    });
                    dijit.byId("selectEmbryo").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DMarkers").attr({
                        disabled: false
                    });
                    dijit.byId("toggle2DRegions").attr({
                        disabled: false
                    });
                    dijit.byId("create2DMarker").attr({
                        disabled: false
                    });
                    dijit.byId("create2DRegion").attr({
                        disabled: false
                    });
                }
                ngembryo.engine.refresh();
            }
        });
        toolbar.addChild(takeMeasurement);
        
        /* A drop-down orientation menu. */
        var orientationMenu = new dijit.Menu({
            style: "display: none;"
        });
        var selectOrientation = new dijit.MenuItem({
            id: "selectOrientationMenuItem",
            index: 1,
            label: "Select",
            onClick: function(){
                ngembryo.orientation.display();
            }
        });
        orientationMenu.addChild(selectOrientation);
        var createOrientation = new dijit.MenuItem({
            id: "createOrientationMenuItem",
            index: 2,
            label: "Create",
            onClick: function(){
                ngembryo.orientation.create();
            }
        });
        orientationMenu.addChild(createOrientation);
        var orientationDropDown = new dijit.form.DropDownButton({
            label: "Orientation",
            name: "orientationDropDown",
            dropDown: orientationMenu,
            id: "orientationDropDown",
            style: "float:left;"
        });
        toolbar.addChild(orientationDropDown);
        
        /* A drop-down layer menu. */
        var layerMenu = new dijit.Menu({
            style: "display: none;"
        });
        var selectLayer = new dijit.MenuItem({
            id: "selectLayerMenuItem",
            index: 1,
            label: "Select",
            onClick: function(){
                ngembryo.layer.display();
            }
        });
        layerMenu.addChild(selectLayer);
        var createLayer = new dijit.MenuItem({
            id: "createLayerMenuItem",
            index: 2,
            label: "Create",
            onClick: function(){
                ngembryo.layer.create();
            }
        });
        layerMenu.addChild(createLayer);
        var layerDropDown = new dijit.form.DropDownButton({
            label: "Layer",
            name: "layerDropDown",
            dropDown: layerMenu,
            id: "layerDropDown",
            style: "float:left;"
        });
        toolbar.addChild(layerDropDown);

        /* A drop-down resource menu. */
        var resourceMenu = new dijit.Menu({
            style: "display: none;"
        });
        var displayResource = new dijit.MenuItem({
            id: "displayResourceMenuItem",
            index: 1,
            label: "Display",
            onClick: function(){
                ngembryo.resource.display();
            }
        });
        resourceMenu.addChild(displayResource);
        var createResource = new dijit.MenuItem({
            id: "createResourceMenuItem",
            index: 1,
            label: "Create",
            onClick: function(){
                ngembryo.resource.create();
            }
        });
        resourceMenu.addChild(createResource);
        var resourceDropDown = new dijit.form.DropDownButton({
            label: "Resource",
            name: "resourceDropDown",
            dropDown: resourceMenu,
            id: "resourceDropDown",
            style: "float:left;"
        });
        toolbar.addChild(resourceDropDown);
		        
        /* About and Help buttons. */
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
    }
});
