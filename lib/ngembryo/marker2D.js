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
 * @classDescription This class encapsulates a 2D marker.
 *
 * The Marker2D class inherits methods and properties from the
 * generic annotation class, Annotation. This class also implements
 * the interface method draw(), which will be invoked to render a
 * 2D marker on a Dojo surface.
 *
 * @see Annotation
 */
var Marker2D = new Class({
    Extends: Annotation,
    
    /**
     * This function creates a 2D marker. Every 2D marker is associated with
     * an unique identifier, which is used to differentiate between 2D markers.
     * The label of a 2D marker is a short name for the marker, and the description
     * supplies further information about the marker. Since every 2D marker is
     * placed on a two-dimensional map, it has a two-dimensional coordiate (x, y).
     * In order to display the marker on the map, an icon is used.
     *
     * @param {Object} Icon manager for retrieving icon image.
     * @param {Integer} id Unique identifier for the marker.
     * @param {String} label The short name of the marker.
     * @param {String} description Description of the marker.
     * @param {Integer} cx The x-coordinate of marker position.
     * @param {Integer} cy The y-coordinate of marker position.
     * @param {String} icon The icon that will be displayed at (x, y).
     * @return {Object} marker The new 2D marker.
     */
    initialize: function(iconManager, id, label, description, x, y, icon){
        this.eventConnections = [];
        this.iconManager = iconManager;
        
        var x, y; /* Actual coordinates after icon size adjustment (see below). */
        /*
         * Retrieve the icon object using the unique icon name. If the icon with
         * the supplied name cannot be found, a default icon will be used.
         */
        var i = iconManager.getIcon(icon);
        var c = i.adjustCoordinates(x, y);
        
        /* The 2D-coordinate of the marker (for display on the screen). */
        this.x = c.x;
        this.y = c.y;
        
        /* We also store the original marker 2D-coordinate. */
        this._x = x;
        this._y = y;
        
        this.icon = i.name; /* We only store the name. */
        this.parent('2dmarker', id, label, description);
    },
    
    
    destroy: function(){
        dojo.forEach(this.eventConnections, dojo.disconnect);
    },
	
    /**
     * This function draws a 2D marker on the dojo surface, and returns the
     * Dojo group that can be used as handle.
     *
     * @param {Object} surface The Dojo surface to use as canvas.
     * @param {Object} Label renderer.
     */
    draw: function(surface, labelRenderer){
        if ($defined(surface)) {
            if (!dojo.isString(this.icon)) {
                this.icon = "default";
                console.warn("Using default icon.");
            }
            var i = this.iconManager.getIcon(this.icon);
            if (dojo.isObject(i)) {
            
                /* A 2D marker consists of three group items. Depending on
                 * the event, some or all of these items are displayed.
                 */
                var grpMarker = surface.createGroup();
                grpMarker.id = this.id;
                grpMarker.label = this.label;
                grpMarker.description = this.description;
                grpMarker.type = this.type;
                
                /* TODO: Setting the properties etc. should be done by using JSON. */
                /* Create the marker label. */
                var grpLabel = grpMarker.createGroup();
                var dim = surface.getDimensions();
                labelRenderer.render(grpLabel, this.label, this.description, this._x, this._y, dim.width / 2, dim.height / 2);
                
                /* Create the marker icon. */
                var markerIcon = grpMarker.createImage({
                    x: this.x,
                    y: this.y,
                    width: i.width,
                    height: i.height,
                    src: i.src
                });
                dojo.style(markerIcon.getNode(), "cursor", "pointer");
                var markerIconH = grpMarker.createImage({
                    x: this.x,
                    y: this.y,
                    width: i.width,
                    height: i.height,
                    src: "resources/images/activity.png"
                });
                dojo.style(markerIconH.getNode(), "cursor", "pointer");
                
                /* Event handling when mouse over marker icon. */
                var timer = null; // Timer used to delay before highlighting marker.
                this.eventConnections.push(dojo.connect(markerIcon.getNode(), "onmouseenter", function(){
                    if (!ngembryo.engine.isMarker2DLabelVisible()) {
                        timer = setTimeout(function(){
                            grpMarker.add(grpLabel);
                            grpMarker.remove(markerIcon);
                            grpMarker.add(markerIconH);
                            grpMarker.moveToFront();
                        }, 800);
                    }
                }));
                this.eventConnections.push(dojo.connect(markerIcon.getNode(), "onmouseleave", function(){
                    clearTimeout(timer);
                }));
                this.eventConnections.push(dojo.connect(markerIcon.getNode(), "onclick", function(){
                    ngembryo.dialogManager.showResources(grpMarker.id, grpMarker.label, grpMarker.description, grpMarker.type);
                }));
                
                this.eventConnections.push(dojo.connect(markerIconH.getNode(), "onmouseleave", function(){
                    if (!ngembryo.engine.isMarker2DLabelVisible()) {
                        clearTimeout(timer);
                        grpMarker.remove(grpLabel);
                        grpMarker.remove(markerIconH);
                        grpMarker.add(markerIcon);
                    }
                }));
                this.eventConnections.push(dojo.connect(markerIconH.getNode(), "onclick", function(){
                    ngembryo.dialogManager.showResources(grpMarker.id, grpMarker.label, grpMarker.description, grpMarker.type);
                }));
                
                if (ngembryo.engine.isMarker2DVisible()) {
                    if (!ngembryo.engine.isMarker2DLabelVisible()) 
                        grpMarker.remove(grpLabel);
                    grpMarker.remove(markerIconH);
                    grpMarker.add(markerIcon);
                    surface.add(grpMarker);
                }
                else {
                    surface.remove(grpMarker);
                    console.info("Surface remove.");
                }
                console.info("Marker created.");
            }
            else {
                console.error("Faulty icon sub-system.");
            }
        }
        else {
            console.error("Undefined Dojo surface.");
        }
    }
});
