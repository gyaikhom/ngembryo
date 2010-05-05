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
 * There are three types of annotations, described as follows:
 * 1) 2D marker - These are markers placed on a two-dimensional image map.
 * 2) 2D region - These are regions, represented by closed polylines,
 *                which are placed on a two-dimensional image map.
 * 3) 3D marker - These are markers placed on a two-dimensional rendering of
 *                a three-dimensional object.
 */
var Annotation = new Class({
    type: undefined, // Type of the annotation.
    id: undefined, // Unique identifier of this annotation.
    label: undefined, // Label displayed when mouse hovering.
    description: undefined, // Further description about the annotation.
    resources: undefined, // List of linked resources.
    initialize: function(type, id, label, description, resources){
        this.type = type;
        this.id = id;
        this.label = label;
        this.description = description;
        this.resources = resources;
    },
	
	/**
	 * Draws the annotation on a Dojo surface.
	 * 
	 * This method interface should be implemented by inherited classes.
	 */
    draw: function(){
        console.warn("Method 'draw()' is an interface.");
    }
});


