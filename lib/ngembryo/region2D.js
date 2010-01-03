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
    initialize: function(id, label, description, topleft_x, topleft_y, bottomright_x, bottomright_y, polyline){
        this.polyline = polyline;
        this.topleft_x = topleft_x;
        this.topleft_y = topleft_y;
        this.bottomright_x = bottomright_x;
        this.bottomright_y = bottomright_y;
        this.parent('2dregion', id, label, description);
    },
    
    sortX: function(a, b){
        return a.x - b.x;
    },
    sortY: function(a, b){
        return a.y - b.y;
    },
    sortRank: function(a, b){
        return a.rank - b.rank;
    },
    
    setMedian: function(){
        if ($defined(this.polyline)) {
            var i = this.polyline.length / 2;
            if (this.polyline.length % 2) 
                i++;
            var s = this.polyline.sort(this.sortX);
            this.median_x = s[i].x;
            s = this.polyline.sort(this.sortY);
            this.median_y = s[i].y;
        }
        else {
            this.median_x = -1;
            this.median_y = -1;
            console.error("Polyline is not defined for median calculation.");
        }
    },
    getMedian: function(){
        var m = new Object();
        m.x = this.median_x;
        m.y = this.median_y;
        return m;
    },
    setCentroid: function(){
        if ($defined(this.polyline)) {
            var t = 0;
            
            /* Ignore last polyline point because it is a repeat to close the polygon. */
            var k = this.polyline.length - 1;
            
            for (var i = 0; i < k; i++) 
                t += this.polyline[i].x;
            this.centroid_x = t / k;
            
            t = 0;
            for (var i = 0; i < k; i++) 
                t += this.polyline[i].y;
            this.centroid_y = t / k;
        }
        else {
            this.centroid_x = -1;
            this.centroid_y = -1;
            console.error("Polyline is not defined for centroid calculation.");
        }
    },
    getCentroid: function(){
        var c = new Object();
        c.x = this.centroid_x;
        c.y = this.centroid_y;
        return c;
    },
    
    /**
     * This function draws a 2D region on the dojo surface, and returns the
     * Dojo group that can be used as handle.
     *
     * @param {Object} surface The Dojo surface to use as canvas.
     * @param {Object} Label renderer.
     */
    draw: function(surface, labelRenderer){
        if ($defined(surface)) {
            /* A 2D region consists of three group items. Depending on
             * the event, some or all of these items are displayed.
             */
            var grpRegion = surface.createGroup();
            grpRegion.id = this.id;
            grpRegion.label = this.label;
            grpRegion.description = this.description;
            grpRegion.type = this.type;
            
            /* TODO: Setting the properties etc. should be done by using JSON. */
            /* Create the region label. */
            var grpLabel = grpRegion.createGroup();
            var dim = surface.getDimensions();
            this.setCentroid();
            var m = this.getCentroid();
            labelRenderer.render(grpLabel, this.label, this.description, m.x, m.y, dim.width / 2, dim.height / 2);
            
            /* Create the region polyline. */
            var regionPolyline = grpRegion.createPolyline(this.polyline);
            
            regionPolyline.setStroke({
                color: "blue"
            });
            regionPolyline.setFill([255, 165, 0, 0.25]);
            dojo.style(regionPolyline.getNode(), "cursor", "pointer");
            
            var regionPolylineH = grpRegion.createPolyline(this.polyline);
            regionPolylineH.setStroke({
                color: "red"
            });
            regionPolylineH.setFill([255, 0, 0, 0.35]);
            dojo.style(regionPolylineH.getNode(), "cursor", "pointer");
            
            
            /* Event handling when mouse over marker icon. */
            var timer = null; // Timer used to delay before highlighting region.
            var handleMouseEnter = function(){
                if (!ngembryo.engine.isRegion2DLabelVisible()) {
					// We use a timer to delay displaying regional information.
					// This prevents the engine from displaying information about
					// the region when the mouse is moved around. By putting a delay,
					// which could be cancelled upon a mouseleave event, we ensure that
					// information is displayed only when it is certain that the user
					// has made a request by hovering continuously over the region.
                    timer = setTimeout(function(){
                        grpRegion.remove(regionPolyline);
                        grpRegion.add(regionPolylineH);
                        grpRegion.add(grpLabel);
                        grpRegion.moveToFront();
                    }, 800);
                }
            };
            
            regionPolyline.connect("onmouseenter", handleMouseEnter);
            regionPolyline.connect("onmouseleave", function(){
                clearTimeout(timer);
            });
            
            regionPolyline.connect("onclick", function(){
                ngembryo.dialogManager.showResources(grpRegion.id, grpRegion.label, grpRegion.description, grpRegion.type);
            });
            
            var handleMouseLeave = function(){
                if (!ngembryo.engine.isRegion2DLabelVisible()) {
                    clearTimeout(timer);
                    grpRegion.remove(grpLabel);
                    grpRegion.remove(regionPolylineH);
                    grpRegion.add(regionPolyline);
                }
            };
            
            regionPolylineH.connect("onmouseleave", handleMouseLeave);
            regionPolylineH.connect("onclick", function(){
                ngembryo.dialogManager.showResources(grpRegion.id, grpRegion.label, grpRegion.description, grpRegion.type);
            });
            
            if (ngembryo.engine.isRegion2DVisible()) {
                if (!ngembryo.engine.isRegion2DLabelVisible()) 
                    grpRegion.remove(grpLabel);
                grpRegion.remove(regionPolylineH);
                grpRegion.add(regionPolyline);
                surface.add(grpRegion);
            }
            else {
                surface.remove(grpRegion);
            }
        }
        else {
            console.error("Undefined Dojo surface.");
        }
    }
    
});
