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
 * @classDescription Wraps annotation engine for use with woolz viewer.
 */
var NGEmbryoWoolz = Class({
	
	/**
	 * Initialises the annotation engine surface inside the woolz model
	 * and establishes the event notification connections. The annotation
	 * surface is displayed over the embryo tiles; hence, all of the events
	 * must go through the annotation engine. By establishing the correct
	 * event connections here, we can forward any events to the woolz model.
	 *  
	 * @param {Object} source DOM element inside which Woolz image tiles are displayed.
	 * @param {Object} model Woolz embryo model.
	 * @param {Object} types Event types.
	 */
	initialize: function(source, model, types) {
	    this.source = source;
	    this.w = model.viewport.width;
	    this.h = model.viewport.height;

	    console.debug("Model: " + this.w + "x" +  this.h);
	    model.attach(this, types);

	    /* Attach a Dojo canvas where all of the annotations will be drawn. */
	    this.canvas = new Element( 'div', {
			id: 'canvas'
		});
	    /* Put this canvas inside the WoolzIIP element. */
	    this.canvas.injectInside(this.source);
	    
	    /* Ensure that the canvas is itself draggable. In the drag handler below,
	     *  we pass any drag event to the WoolzIIP element. Of course, this is when
	     *  we will update the markers, regions etc.
	     */
	    this.canvas.makeDraggable(getDragOpts("canvas", 0, this));

	    /*
	     * Create an annotation engine, which will use the canvas created above.
	     */
	    this.engine = new NGEmbryoAnnotator("canvas", this.w, this.h);

	    /*
	     * Create the controls. I am doing this because I want to have more control
	     * over what is displayed over the canvas. I am not going to use what is
	     * provided by the WoolzIIP viewer (indeed, the IIPManager, which is derived from
	     * the WoolzIIP viewer, does not contain any of these control.
	     */
   	    this.zoomSlider = new Element( 'div', {
   			id: 'zoomSlider'
   		});

	    /* Put this zoom slider inside the canvas. */
	    this.zoomSlider.injectInside(this.source);

	    /* Actually create the zoom slider using Dojo. */
	    this.zoomSliderControl = new dijit.form.HorizontalSlider({
		    name: "Zoom",
		    value: 5,
		    minimum: -10,
		    maximum: 10,
		    intermediateChanges: true,
		    style: "position:relative;left:10px;top:10px;width:300px;",
		    onChange: function(value){
			console.debug("Zoom: " + value);
		    }
		}, this.zoomSlider);
	},
	handleDrag: function(done) {
	    var notifications = new Array();
	    notifications.push(typeEnum.viewport);
	    this.notify(notifications);
	},

	update: function(types, triggers) {
	    ngembryo.refresh();
	}
});
