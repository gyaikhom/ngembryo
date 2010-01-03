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
 * @classDescription This class encapsulates a 3D marker.
 * 
 * The Marker3D class inherits methods and properties from the
 * generic annotation class, Annotation. This class also implements
 * the interface method draw(), which will be invoked to render a
 * 3D marker on a Dojo surface.
 * 
 * @see Annotation
 */
var Marker3D = new Class({
    Extends: Annotation,
    
    /**
     * This function creates a 3D marker. Every 3D marker is associated with
     * an unique identifier, which is used to differentiate between 3D markers.
     * The label of a 3D marker is a short name for the marker, and the description
     * supplies further information about the marker. Since every 3D marker is
     * placed on a two-dimensional rendering of a three-dimensional object, it has
     * a three-dimensional coordiate (x, y, z). In order to display the marker on the
     * three-dimensional rendering, an icon is used.
     *
     * @param {Integer} id Unique identifier for the marker.
     * @param {String} label The short name of the marker.
     * @param {String} description Description of the marker.
     * @param {Integer} cx The x-coordinate of marker position.
     * @param {Integer} cy The y-coordinate of marker position.
     * @param {Integer} cz The z-coordinate of marker position.
     * @param {String} icon The icon that will be displayed at (x, y, z).
     * @return {Object} marker The new 3D marker.
     */
    initialize: function(id, label, description, x, y, z, icon){
        var x, y, z; /* Actual coordinates after icon size adjustment (see below). */
        /*
         * TODO: The three-dimensional coordinate (cx, cy, cz) must be first transformed
         * in order to identify the exact location of the marker (ex, ey) with reference to the
         * two-dimensional rendering of the object.
         */
        /*
         * Retrieve the icon object using the unique icon name. If the icon with
         * the supplied name cannot be found, a default icon will be used.
         */
        var i = ngembryo.icons.getIcon(icon);
        var c = i.adjustCoordinates(x, y);
        
        /* The 2D-coordinate of the marker (for display on the screen). */
        this.x = c.x;
        this.y = c.y;
        
        /* We also store the original marker 3D-coordinate. */
        this._x = x;
        this._y = y;
        this._z = z;
        
        this.icon = i.name(); /* We only store the name. */
        this.parent('3dmarker', id, label, description);
    }
});
