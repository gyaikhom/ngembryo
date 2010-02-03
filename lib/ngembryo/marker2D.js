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
    initialize: function(im, id, label, description, x, y, icon){
        this.ec = []; /* Event connections created by this object. */
        this.mi = null; /* The marker object to be created. */
        this.im = im; /* Icon manager. */
        var x, y; /* Actual coordinates after icon size adjustment (see below). */
        /*
         * Retrieve the icon object using the unique icon name. If the icon with
         * the supplied name cannot be found, a default icon will be used.
         */
        var i = im.getIcon(icon);
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
    
    /**
     * Destroys the marker object by disconnecting events.
     */
    destroy: function(){
        dojo.forEach(this.ec, dojo.disconnect);
        this.ec = null;
        this.mi = null;
    },
    
    /**
     * This function draws a 2D marker on the dojo surface.
     *
     * @param {Object} surface The Dojo surface to use as canvas.
     */
    draw: function(surface){
        if ($defined(surface)) {
            if (!dojo.isString(this.icon)) {
                this.icon = "default";
                console.warn("Using default icon.");
            }
            var i = this.im.getIcon(this.icon);
            if (dojo.isObject(i)) {
                /* Create the marker icon. */
                this.mi = surface.createImage({
                    x: this.x,
                    y: this.y,
                    width: i.width,
                    height: i.height,
                    src: i.src
                });
                var n = this.mi.getNode();
                dojo.style(n, "cursor", "pointer");
                
                /* Event handling. */
                var id = this.id;
                var l = this.label;
                var d = this.description;
                var t = this.type;
                
                var home = function(event){
                    var x = event.clientX - ngembryo.engine.dim.x;
                    var y = event.clientY - ngembryo.engine.dim.y;
                    ngembryo.content.tipper.move(x, y);
                    ngembryo.content.tipper.show(l, d);
                }
                this.ec.push(dojo.connect(n, "onmouseenter", home));
                
                var homl = function(){
                    ngembryo.content.tipper.hide();
                }
                this.ec.push(dojo.connect(n, "onmouseleave", homl));
                
                var homc = function(){
                    ngembryo.content.tipper.hide();
                    ngembryo.dialogManager.showResources(id, l, d, t);
                }
                this.ec.push(dojo.connect(n, "onclick", homc));
                
                if (ngembryo.engine.isMarker2DVisible()) {
                    surface.add(this.mi);
                }
                else {
                    surface.remove(this.mi);
                }
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
