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
 * @classDescription This class encapsulates a 2D region.
 *
 * The Region2D class inherits methods and properties from the
 * generic annotation class, Annotation. This class also implements
 * the interface method draw(), which will be invoked to render a
 * 2D region on a Dojo surface.
 *
 * @see Annotation
 */
var Region2D = new Class({
    Extends: Annotation,
    /**
     * This function creates a 2D region. Every 2D region is associated with a
     * unique identifier, which is used to differentiate between 2D regions.
     * The label of a 2D region is a short name for the region, and the description
     * supplies further information about the region. Since evry 2D region is a
     * closed polygon, it is associated with a polyline, marking the boundary of
     * the region.
     *
     * @param {Integer} id Unique identifier for the region.
     * @param {String} label The short name of the region.
     * @param {String} description Description of the region.
     * @param {List} polyline List of points marking the region.
     * @return {Object} region The new 2D region.
     */
    initialize: function(id, label, description, resources, topleft_x, topleft_y, bottomright_x, bottomright_y, polyline){
        this.ec = []; /* Event connections created by this object. */
        this.rp = null; /* The region object to be created. */
        this.polyline = polyline;
        this.topleft_x = topleft_x;
        this.topleft_y = topleft_y;
        this.bottomright_x = bottomright_x;
        this.bottomright_y = bottomright_y;
        this.parent('2dregion', id, label, description, resources);
    },
    
    /**
     * Destroys the region by disconnecting all of the events.
     */
    destroy: function(){
        dojo.forEach(this.ec, dojo.disconnect);
        this.ec = null;
        this.rp = null;
    },
    
    /**
     * This function draws a 2D region on the dojo surface.
     *
     * @param {Object} surface The Dojo surface to use as canvas.
     */
    draw: function(surface){
        if ($defined(surface)) {
            /* Create the region polyline. */
            var rp = surface.createPolyline(this.polyline);
            var n = rp.getNode();
            rp.setStroke([0, 0, 100, 0.25]);
            rp.setFill([100, 0, 0, 0.25]);
            dojo.style(n, "cursor", "pointer");
            
            /* Event handling. */
            var id = this.id;
            var l = this.label;
            var t = this.type;
            var d = this.description;
            
			/*
			 * New requirement from April 30. List resources when hovering.
			 */
			var r = "";
			var m = "";
			if ($defined(this.resources) && this.resources.count > 0) {
				var res = this.resources.resources;
				r = "<ul>";
				for ( var q = 0; q < res.length; q++) {
					r += "<li><span class='title'>" + res[q].title + "</span> by <span class='author'>" + res[q].author + "</span></li>";
				}
				r += "</ul>";
				m = "Annotation linked to <span style='color: #ff0000;'>" + this.resources.count + "</span> resources. Click for more...";
			} else {
				r = "No resources are currently linked to this annotation.";
			}

            this.rp = rp; /* Used for cleanup. */
            var home = function(event){
                rp.setFill([255, 0, 0, 0.50]);
                var x = event.clientX - ngembryo.engine.dim.x;
                var y = event.clientY - ngembryo.engine.dim.y;
                ngembryo.content.tipper.move(x, y);
                ngembryo.content.tipper.show(l, r, m);
            };
            this.ec.push(dojo.connect(n, "onmouseenter", home));
            
            var homm = function(event){
                var x = event.clientX - ngembryo.engine.dim.x;
                var y = event.clientY - ngembryo.engine.dim.y;
                ngembryo.content.tipper.move(x, y);
            }
            this.ec.push(dojo.connect(n, "onmousemove", homm));
            
            var homc = function(event){
                ngembryo.content.tipper.hide();
                ngembryo.resource.displayLinked(id, t, l, d);
            }
            this.ec.push(dojo.connect(n, "onclick", homc));
            
            var homl = function(){
                ngembryo.content.tipper.hide();
                rp.setFill([100, 0, 0, 0.25]);
            };
            this.ec.push(dojo.connect(n, "onmouseleave", homl));
            
            if (ngembryo.engine.isRegion2DVisible()) {
                surface.add(rp);
            }
            else {
                surface.remove(rp);
            }
        }
        else {
            console.error("Undefined Dojo surface.");
        }
    }
    
});
