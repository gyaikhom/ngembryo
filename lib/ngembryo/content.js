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
 * @classDescription This class encapsulates the web application content.
 * 
 * This initialises the Woolz image and annotation targetframes, tipper
 * (displayed when hovering over annotations), and feedback engine (displays
 * server feedback).
 */
var Content = new Class( {
	initialize : function(application) {
		this.a = application;
		/* Content panel displays the embryo images, annotations, and controls. */
		this.content = new dijit.layout.ContentPane( {
			id : "content",
			region : "center"
		});
		/* Attach content to the application. */
		application.addChild(this.content);
		var d = this.content.domNode;

		/* Create Woolz target frame for drawing the background images. */
		dojo.create("div", {
			id : "woolz"
		}, d);

		/* Create target frame for drawing the annotations. */
		dojo.create("div", {
			id : "annot"
		}, d);

		/* Create shadow for target frame. */
		dojo.create("div", {
			id : "tfshadow"
		}, d);

		/* Create the controls container. */
		dojo.create("div", {
			id : "controls",
			style : {
				visibility : 'hidden'
			}
		}, d);

		/*
		 * When the cursor hovers over annotations, information is displayed
		 * relative to the position of the mouse cursor. Create the <div> which
		 * contains this information.
		 */
		this.tipper = new Tipper(d, 10, 10);

		/*
		 * This is for showing feedback from server.
		 */
		this.feedback = new Feedback(2000, 1500, 3500, 100, 'feedback');
	},

	/**
	 * Destroys the content.
	 */
	destroy : function() {
		if ($defined(this.feedback)) {
			this.feedback.destroy();
			this.feedback = null;
		}
		if ($defined(this.tipper)) {
			this.tipper.destroy();
			this.tipper = null;
		}
		if ($defined(this.content)) {
			this.content.destroyRecursive();
			this.content = null;
		}
	}
});
