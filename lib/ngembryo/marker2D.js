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
 * The Marker2D class inherits methods and properties from the generic
 * annotation class, Annotation. This class also implements the interface method
 * draw(), which will be invoked to render a 2D marker on a Dojo surface.
 * 
 * @see Annotation
 */
var Marker2D = new Class( {
	Extends : Annotation,

	/**
	 * This function creates a 2D marker. Every 2D marker is associated with an
	 * unique identifier, which is used to differentiate between 2D markers. The
	 * label of a 2D marker is a short name for the marker, and the description
	 * supplies further information about the marker. Since every 2D marker is
	 * placed on a two-dimensional map, it has a two-dimensional coordiate (x,
	 * y). In order to display the marker on the map, an icon is used.
	 * 
	 * @param {Object}
	 *            Icon manager for retrieving icon image.
	 * @param {Integer}
	 *            id Unique identifier for the marker.
	 * @param {String}
	 *            label The short name of the marker.
	 * @param {String}
	 *            description Description of the marker.
	 * @param {Integer}
	 *            cx The x-coordinate of marker position.
	 * @param {Integer}
	 *            cy The y-coordinate of marker position.
	 * @param {String}
	 *            icon The icon that will be displayed at (x, y).
	 * @return {Object} marker The new 2D marker.
	 */
	initialize : function(im, id, label, description, resources, x, y, icon) {
		this.im = im; /* Icon manager. */
		var x, y; /*
					 * Actual coordinates after icon size adjustment (see
					 * below).
					 */
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
		this.parent('m', id, label, description, resources);
	}
});
