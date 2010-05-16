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
 * @classDescription This class encapsulates generic annotations.
 * 
 * Every type of annotation inherits this class. Every inherited class must
 * implement the draw() method, which draws the annotation on a Dojo surface.
 * 
 * There are three types of annotations, described as follows: 1)  marker -
 * These are markers placed on a two-dimensional image map. 2)  region - These
 * are regions, represented by closed polylines, which are placed on a
 * two-dimensional image map.
 */
var Annotation = new Class( {
	/**
	 * Initialises an annotation.
	 * 
	 * @param {String}
	 *            type Type of the annotation.
	 * @param {Integer}
	 *            id Unique identifier of this annotation.
	 * @param {String}
	 *            label Label displayed when mouse hovering.
	 * @param {String}
	 *            description Further description about the annotation.
	 * @param {Object}
	 *            resources List of linked resources.
	 * 
	 */
	initialize : function(type, id, label, description, resources) {
		this.t = type;
		this.id = id;
		this.l = label;
		this.d = description;
		this.r = resources;
		this.e = []; /* Event connections created by this object. */
		this.o = null; /* The annotation object to be created. */
	},

	/**
	 * Draws the annotation on a Dojo surface.
	 */
	draw : function() {
		ngembryo.engine.render(this);
	},
	
	/**
	 * Destroys the region by disconnecting all of the events.
	 */
	destroy : function() {
		dojo.forEach(this.e, dojo.disconnect);
		this.e = null;
		this.o = null;
	}
});
