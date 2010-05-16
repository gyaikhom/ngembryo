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
 * @classDescription This class encapsulates a  region.
 * 
 * The Region class inherits methods and properties from the generic
 * annotation class, Annotation. This class also implements the interface method
 * draw(), which will be invoked to render a  region on a Dojo surface.
 * 
 * @see Annotation
 */
var Region = new Class( {
	Extends : Annotation,
	/**
	 * This function creates a  region. Every  region is associated with a
	 * unique identifier, which is used to differentiate between  regions. The
	 * label of a  region is a short name for the region, and the description
	 * supplies further information about the region. Since every  region is a
	 * closed polygon, it is associated with a polyline, marking the boundary of
	 * the region. The bounding rectangle may be used for calculations. For the
	 * current version, it has been disabled to make the region object small.
	 * 
	 * @param {Integer}
	 *            id Unique identifier for the region.
	 * @param {String}
	 *            label The short name of the region.
	 * @param {String}
	 *            description Description of the region.
	 * @param {Object}
	 *            resources The resources currently linked to this annotation.
	 * @param {Integer}
	 *            topleft_x x-coordinate of top-left corner of bounding
	 *            rectangle.
	 * @param {Integer}
	 *            topleft_y y-coordinate of top-left corner of bounding
	 *            rectangle.
	 * @param {Integer}
	 *            bottomright_x x-coordinate of bottom-right corner of bounding
	 *            rectangle.
	 * @param {Integer}
	 *            bottomright_y y-coordinate of bottom-right corner of bounding
	 *            rectangle.
	 * @param {List}
	 *            polyline List of points marking the region.
	 * @return {Object} region The new  region.
	 */
	// NOTE: We do not require bounding rectangle for the moment.
	// initialize : function(id, label, description, resources, topleft_x,
	// topleft_y, bottomright_x, bottomright_y, polyline) {
	initialize : function(id, label, description, resources, polyline) {
		this.p = polyline;

		// NOTE: We do not require bounding rectangle for the moment.
		// this.tlx = topleft_x;
		// this.tly = topleft_y;
		// this.brx = bottomright_x;
		// this.bry = bottomright_y;

		this.parent('r', id, label, description, resources);
	}
});
