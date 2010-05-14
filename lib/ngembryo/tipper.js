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
 * @classDescription This class encapsulates the information tipper.
 * 
 * The information tipper is activated when the mouse hovers over an annotation:
 * either markers or regions. When regions are highlighted, the tipper follows
 * the mouse pointer.
 */
var Tipper = new Class({
	/**
	 * Initialises the tipper inside the container DOM.
	 * 
	 * @param {Object}
	 *            c Container DOM node.
	 * @param {Integer}
	 *            displaceX Horizontal displacement.
	 * @param {Integer}
	 *            displaceY Vertical displacement.
	 */
    initialize: function(c, displaceX, displaceY){
		this.pw = displaceX;
		this.ph = displaceY;
		
        var f = dojo.create("div", {
            id: "tipper"
        }, c);
        dojo.create("div", {
            id: "tipperL"
        }, f);
        dojo.create("div", {
            id: "tipperD"
        }, f);
        dojo.create("div", {
            id: "tipperM"
        }, f);
    },
    
    /**
	 * Shows the tipper with the supplied content.
	 * 
	 * @param {String}
	 *            l Label.
	 * @param {String}
	 *            d Description.
	 * @param {String}
	 *            m More information.
	 */
    show: function(l, d, m){
        dojo.attr("tipperL", {
            innerHTML: l
        });
        dojo.attr("tipperD", {
            innerHTML: d
        });
        dojo.attr("tipperM", {
            innerHTML: m
        });
        dojo.attr("tipper", "style", {
            visibility: "visible",
        });
        if (!$defined(this.w) || !$defined(this.h)) {
        	this.w = dojo.style("tipper", "width");
        	this.h = dojo.style("tipper", "height");
            /*
			 * Make adjustment relative to mouse pointer.
			 */
        	this.w += this.pw;
        	this.h += this.ph;
        }
    },
    
    /**
	 * Hides the tipper.
	 */
    hide: function(){
        dojo.attr("tipper", "style", {
            visibility: "hidden"
        });
    },
    
    /**
	 * Moves the tipper relative to the mouse position.
	 * 
	 * @param {Integer}
	 *            x x-coordinate relative to screen.
	 * @param {Integer}
	 *            y y-coordinate relative to screen.
	 */
    move: function(x, y){
    	/*
		 * We always try to show the tipper within the browser window. To do
		 * this, we check which position relative to the mouse pointer the
		 * tipper will fit.
		 */
        var left = false;
        var up = false;
        
        if (x + this.w > ngembryo.engine.dim.w) 
            left = true;
        if (y + this.h > ngembryo.engine.dim.h) 
            up = true;
        
        var l = (left ? -this.w : this.pw);
        var t = (up ? -this.h : this.ph);
        dojo.style("tipper", "left", x + l + "px");
        dojo.style("tipper", "top", y + t + "px");
    },
    /**
     * Destroys the tipper.
     */
    destroy: function(){
        dojo.destroy("tipperD");
        dojo.destroy("tipperL");
        dojo.destroy("tipper");
    }
});
