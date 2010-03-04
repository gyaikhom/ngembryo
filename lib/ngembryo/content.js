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
var Content = new Class( {
	initialize : function(a) {
		/* Content panel displays the embryo images, annotations, and controls. */
		var c = new dijit.layout.ContentPane( {
			id : "content",
			region : "center"
		});

		/* Create Woolz target frame for drawing the background images. */
		var w = dojo.create("div", {
			id : "woolztargetframe"
		}, c.domNode);

		/* Create target frame for drawing the annotations. */
		var t = dojo.create("div", {
			id : "targetframe"
		}, c.domNode);

		/* Create shadow for target frame. */
		var ts = dojo.create("div", {
			id : "tfshadow"
		}, c.domNode);

		/* Create the controls. */
		var ct = dojo.create("div", {
			id : "controls",
			style : {
				visibility : 'hidden'
			}
		}, c.domNode);

		/*
		 * When the cursor hovers over annotations, information is displayed
		 * relative to the position of the mouse cursor. Create the <div> which
		 * contains this information.
		 */
		this.tipper = new Tipper(c.domNode);

		/* Attach content to the application. */
		a.addChild(c);
	}
});
