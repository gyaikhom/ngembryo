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
 * @classDescription This class encapsulates an annotation rendering engine.
 *
 * The annotation engine is the heart of the annotation management system.
 * It controls the retrieval, display and update of annotations, by establishing
 * communication with the annotation server.
 */
var AnnotationEngine = new Class({
    initialize: function(target){
        this.target = target; // Unique DOM ID of the target frame div.
        this.parent = null; // DOM element where the Dojo surface is created.
        this.dim = null; // Dimension of the target frame (this.parent).
        this.m2DV = true; // If true, displays 2D markers.
        this.m2DLV = false; // If true, displays 2D marker labels.
        this.m3DV = true; // If true, displays 3D markers.
        this.m3DLV = false; // If true, displays 3D marker labels.
        this.r2DV = true; // If true, displays 2D regions.
        this.r2DLV = false; // If true, displays 2D region labels.
        this.cc = false; // If true, display create canvas.
        this.ccType = 1; // Type of annotation to be created using the create canvas.
        this.ccTypeEnum = {
            c2dm: 1,
            c2dr: 2
        }; // Enumeration of accepted types.
        this.ccHandler = null; // Handles annotation creation on the create canvas.
        this.surface = null; // Dojo surface for drawing annotations.
        this.layers = null; // Manages the annotation layers.
        this.icons = null; // manages the icons used for displaying markers.
        this.labels = null; // Used for rendering labels properly.
        this.regionPoints = new Array(); // Used for creating polyline regions.
    },
    
    start: function(){
        if ($defined(this.target)) {
            this.parent = dojo.byId(this.target); // Target frame DOM element where the Dojo surface is created.
            this.dim = dojo.coords(this.parent); // Get dimension of the target frame DOM element.
            this.surface = this.createSurface(); // Created a dojo surface using the target DOM element.
            this.labelRenderer = new LabelRenderer("Arial", "normal",
							"bold", "9pt", "black", null, "#FFF0B8", null, 0,
							10, 50, 50, true);
            this.layerManager = new LayerManager(this.labelRenderer);
            this.iconManager = new IconManager();
            
            // Register the icons.
            this.iconManager.registerIcon('default', new Icon('resources/images/bookmark.png', 16, 16, 'cc'));
            this.iconManager.registerIcon('bookmark', new Icon('resources/images/bookmark.png', 16, 16, 'cc'));
            this.iconManager.registerIcon('filefind', new Icon('resources/images/filefind.png', 16, 16, 'cc'));
            this.iconManager.registerIcon('activity', new Icon('resources/images/activity.png', 16, 16, 'cc'));
            
            
            /**
             * TODO:For the moment, we have no ordering of layers. So, the
             * last layer added will be displayed on the top.
             */
            this.layerManager.addLayer('2Dregions', true);
            this.layerManager.addLayer('2Dmarkers', true);
            
            console.info("Annotation engine started...");
        }
        else {
            console.error("Undefined target DOM element.")
        }
    },
    
    /**
     * Refreshes the screen and draw with current settings.
     *
     * With every refresh invocation, the engine communicated with the annotation
     * server to retrieve the latest annotations. This is done using Dojo.xhr.
     */
    refresh: function(){
        if ($defined(this.surface)) {
            this.get2DMarkers(0, 0, 1900, 886, 0, 10);
			this.get2DRegions(0, 0, 1900, 886, 0, 10);
            this.surface.clear();
            this.layerManager.displayVisibleLayers(this.surface);
            
            if (this.cc == true) {
                switch (this.ccType) {
                    case this.ccTypeEnum.c2dm:
                        this.activateCreateCanvas2DMarker();
                        break;
                    case this.ccTypeEnum.c2dr:
                        this.activateCreateCanvas2DRegion();
                        break;
                    default:
                        ;                }
            }
        }
        else {
            console.error("Dojo surface is undefined.");
        }
    },
    
    /**
     * Checks if 2D markers should be displayed.
     */
    isMarker2DVisible: function(){
        return this.m2DV;
    },
    
    /**
     * Displays 2D markers.
     */
    showMarker2D: function(){
        this.m2DV = true;
        this.refresh();
    },
    
    /**
     * Hides 2D markers.
     */
    hideMarker2D: function(){
        this.m2DV = false;
        this.refresh();
    },
    
    /**
     * Toggles display of 2D markers.
     */
    toggleMarker2DVisibility: function(){
        this.m2DV = !this.m2DV;
        this.refresh();
    },
    
    /**
     * Checks if 2D marker labels should be displayed.
     */
    isMarker2DLabelVisible: function(){
        return this.m2DLV;
    },
    
    /**
     * Displays 2D marker labels.
     */
    showMarker2DLabel: function(){
        this.m2DLV = true;
    },
    
    /**
     * Hides 2D marker labels.
     */
    hideMarker2DLabel: function(){
        this.m2DLV = false;
    },
    
    /**
     * Toggles display of 2D marker labels.
     */
    toggleMarker2DLabelVisibility: function(){
        this.m2DLV = !this.m2DLV;
        this.refresh();
    },
    
    /**
     * Checks if 3D markers should be dislayed.
     */
    isMarker3DVisible: function(){
        return this.m3DV;
    },
    
    /**
     * Displays 3D markers.
     */
    showMarker3D: function(){
        this.m3DV = true;
    },
    
    /**
     * Hides 3D markers.
     */
    hideMarker3D: function(){
        this.m3DV = false;
    },
    
    /**
     * Toggles display of 3D markers.
     */
    toggleMarker3DVisibility: function(){
        this.m3DV = !this.m3DV;
        this.refresh();
    },
    
    /**
     * Checks if 3D marker labels should be displayed.
     */
    isMarker3DLabelVisible: function(){
        return this.m3DLV;
    },
    
    /**
     * Displays 3D marker labels.
     */
    showMarker3DLabel: function(){
        this.m3DLV = true;
    },
    
    /**
     * Hides 3D marker labels.
     */
    hideMarker3DLabel: function(){
        this.m3DLV = false;
    },
    
    /**
     * Toggles display of 3D marker labels.
     */
    toggleMarker3DLabelVisibility: function(){
        this.m3DLV = !this.m3DLV;
        this.refresh();
    },
    
    /**
     * Checks if 2D regions should be displayed.
     */
    isRegion2DVisible: function(){
        return this.r2DV;
    },
    
    /**
     * Displays 2D regions.
     */
    showRegion2D: function(){
        this.r2DV = true;
    },
    
    /**
     * Hides 2D regions.
     */
    hideRegion2D: function(){
        this.r2DV = false;
    },
    
    /**
     * Toggles display of 2D regions.
     */
    toggleRegion2DVisibility: function(){
        this.r2DV = !this.r2DV;
        this.refresh();
    },
    
    
    /**
     * Checks if 2D region labels should be displayed.
     */
    isRegion2DLabelVisible: function(){
        return this.r2DLV;
    },
    
    /**
     * Displays 2D region labels.
     */
    showRegion2DLabel: function(){
        this.r2DLV = true;
    },
    
    /**
     * Hides 2D region labels.
     */
    hideRegion2DLabel: function(){
        this.r2DLV = false;
    },
    
    /**
     * Toggles display of 2D region labels.
     */
    toggleRegion2DLabelVisibility: function(){
        this.r2DLV = !this.r2DLV;
        this.refresh();
    },
    
    /**
     * Displays the create canvas.
     */
    showCreateCanvas: function(type){
        this.cc = true;
        this.ccType = type;
    },
    
    /**
     * Hides the create canvas.
     */
    hideCreateCanvas: function(){
        this.cc = false;
    },
    
    /**
     * Toggles display of the create canvas.
     */
    toggleCreateCanvasVisibility: function(){
        this.cc = !this.cc;
        this.refresh();
    },
    
    /**
     * Returns true if the create canvas is active.
     */
    isCreateCanvasVisible: function(){
        return this.cc;
    },
    
    /**
     * Sets the type of annotation to be created using the create canvas.
     *
     * @param {Integer} type
     */
    setCreateCanvasType: function(type){
        this.ccType = type;
    },
    
    /**
     * Creates a Dojo surface using the target DOM element.
     *
     * The Dojo surface, if successfully created, is used as a canvas for drawing
     * all of the annotation (by invoking the draw() method, @see Annotation).
     */
    createSurface: function(){
        var surface = null;
        if ($defined(this.parent)) {
            surface = dojox.gfx.createSurface(this.parent, this.dim.w, this.dim.h);
        }
        else {
            console.error("Failed to create Dojo surface: Target canvas '" + this.target + "' is not a DOM element.");
        }
        if ($defined(surface)) {
            console.info("Dojo surface created");
        }
        return surface;
    },
    
    /**
     * Parses the response data and retrieves list of 2D markers.
     * This new list updates the existing 2D markers layer.
     *
     * @param {Object} Layer manager.
     * @param {Object} JSON response.
     */
    __update2DMarkers: function(layerManager, iconManager, data){
        layerManager.emptyLayer("2Dmarkers");
        for (var i = 0; i < data.length; i++) {
            console.log("key", i, "value", data[i]);
            var temp = new Marker2D(iconManager, data[i].id, data[i].label, data[i].description, data[i].x, data[i].y, "bookmark");
            layerManager.addAnnotationToLayer("2Dmarkers", temp);
        }
    },
    
    /**
     * Retrieves 2D markers from the annotation server.
     *
     * This method uses Dojo.xhr Ajax interface for retrieving 2D marker annotations
     * which falls inside a 2D bounding box. The bounding box is specified by
     * its top-left (xl, yl) and bottom-right (xh, yh) coordinates. We assume that
     * the origin is at the top-left corner of the Dojo surface.
     *
     * @param {Integer} xl x-coordinate of top-left corner.
     * @param {Integer} yl y-coordinate of top-left corner.
     * @param {Integer} xh x-coordinate of bottom-right corner.
     * @param {Integer} yh y-coordinate of bottom-right corner.
     * @param {Integer} sl Lowest scale to include.
     * @param {Integer} sh Highest scale to include.
     */
    get2DMarkers: function(xl, yl, xh, yh, sl, sh){
        var func = this.__update2DMarkers;
        var layerManager = this.layerManager;
        var iconManager = this.iconManager;
        dojo.xhrGet({
            url: "get2DMarkers.php?x_low=" + xl + "&x_high=" + xh + "&y_low=" + yl + "&y_high=" + yh + "&scale_low=" + sl + "&scale_high=" + sh + "&format=json",
            handleAs: "json",
            timeout: 5000, // Time in milliseconds
            sync: true,
            load: function(data){
                func(layerManager, iconManager, data);
            },
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
                return response;
            }
        });
    },
    
    /**
     * Parses the response data and retrieves list of 2D regions.
     * This new list updates the existing 2D regions layer.
     *
     * @param {Object} JSON response.
     */
    __update2DRegions: function(layerManager, data){
        layerManager.emptyLayer("2Dregions");
        for (var i = 0; i < data.length; i++) {
            console.log("key", i, "value", data[i]);
            var temp = new Region2D(data[i].id, data[i].label, data[i].description, data[i].tl_x, data[i].tl_y, data[i].br_x, data[i].br_y, data[i].polyline);
            layerManager.addAnnotationToLayer("2Dregions", temp);
        }
    },
    
    /**
     * Retrieves 2D regions from the annotation server.
     *
     * This method uses Dojo.xhr Ajax interface for retrieving annotations which
     * are 2D regions. Only those regions which fall inside a 2D bounding box is retrieved.
     * The bounding box is specified by its top-left (xl, yl) and bottom-right (xh, yh)
     * coordinates. We assume that the origin is at the top-left corner of the Dojo surface.
     *
     * @param {Integer} xl x-coordinate of top-left corner.
     * @param {Integer} yl y-coordinate of top-left corner.
     * @param {Integer} xh x-coordinate of bottom-right corner.
     * @param {Integer} yh y-coordinate of bottom-right corner.
     * @param {Integer} sl Lowest scale to include.
     * @param {Integer} sh Highest scale to include.
     */
    get2DRegions: function(xl, yl, xh, yh, sl, sh){
        var func = this.__update2DRegions;
        var layerManager = this.layerManager;
        dojo.xhrGet({
            url: "get2DRegions.php?x_low=" + xl + "&x_high=" + xh + "&y_low=" + yl + "&y_high=" + yh + "&scale_low=" + sl + "&scale_high=" + sh + "&format=json",
            handleAs: "json",
            timeout: 5000, // Time in milliseconds
            sync: true,
            load: function(data){
                func(layerManager, data);
            },
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
                return response;
            }
        });
    },
    
    __isCloseToFinalPoint: function(x, y){
        if (this.regionPoints.length > 1 &&
        this.regionPoints[0].x - 5 < x &&
        this.regionPoints[0].x + 5 > x &&
        this.regionPoints[0].y - 5 < y &&
        this.regionPoints[0].y + 5 > y) 
            return true;
        else 
            return false;
    },
    
    /**
     * Creates a region by connecting polyline points.
     *
     * @param {Object} grpRegion Surface group for displaying region.
     * @param {Integer} x x-coordinate of the polyline point.
     * @param {Integer} y y-coordinate of the polyline point.
     */
    createRegion: function(grpRegion, px, py){
        var t = {
            x: px,
            y: py
        };
        this.regionPoints.push(t);
        
        /* Check if this is the final connection. */
        if (this.__isCloseToFinalPoint(px, py)) {
            /* Display the finished region. */
            grpRegion.clear();
            var regionPolyline = grpRegion.createPolyline(this.regionPoints);
            regionPolyline.setStroke({
                color: "blue"
            });
            regionPolyline.setFill([255, 165, 0, 0.25]);
            
            /* Open the region creation dialog box for adding details to the region annotation. */
            ngembryo.dialogManager.create2DRegion(this.regionPoints);
			
            // Clear the array and make it ready for the next region.
            this.regionPoints = [];
        }
    },
    
    /**
     * Activates the create canvas by putting an overlay rectangle over the target canvas.
     *
     * Existing markers and regions that are displayed on the target canvas will be inactive
     * but visible through a translucent veil. This helps the user to see what is already
     * marked so that clutter is reduced.
     */
    activateCreateCanvas2DMarker: function(){
        if ($defined(this.surface)) {
            var grpCC = this.surface.createGroup();
            grpCC.description = "Annotation Creation Canvas: 2D Markers";
            var dim = this.surface.getDimensions();
            var cc = grpCC.createRect({
                x: 0,
                y: 0,
                height: dim.height,
                width: dim.width
            });
            /* TODO: Change colors. */
            cc.setFill([0, 0, 100, 0.3]);
            cc.setStroke({
                color: "blue",
                width: 0
            });
            dojo.style(cc.getNode(), "cursor", "crosshair");
            
            /* Event handling when mouse over marker icon. */
            cc.connect("onmouseenter", function(){
            });
            cc.connect("onclick", function(event){
                var x = event.clientX - ngembryo.engine.dim.x;
                var y = event.clientY - ngembryo.engine.dim.y;
                ngembryo.dialogManager.create2DMarker(x, y);
            });
            cc.connect("onmouseleave", function(){
            });
            
            
            /* Put a label to hint the user that creation canvas is active. */
            var ccLabel = grpCC.createText({
                x: 5,
                y: 15,
                text: grpCC.description
            });
            
            /* TODO: Better to put this separately. */
            ccLabel.setFont({
                family: "Arial",
                size: "9pt",
                style: "regular",
                weight: "bold"
            });
            //ccLabel.setStroke("#777777");
            ccLabel.setFill("#ffffff");
            
        }
        else {
            console.error("Undefined Dojo surface.");
        }
    },
    
    activateCreateCanvas2DRegion: function(){
        if ($defined(this.surface)) {
            var grpCC = this.surface.createGroup();
            var grpRegion = this.surface.createGroup();
            grpCC.description = "Annotation Creation Canvas: 2D Region";
            var dim = this.surface.getDimensions();
            var cc = grpCC.createRect({
                x: 0,
                y: 0,
                height: dim.height,
                width: dim.width
            });
            /* TODO: Change colors. */
            cc.setFill([0, 0, 100, 0.3]);
            cc.setStroke({
                color: "blue",
                width: 0
            });
            dojo.style(cc.getNode(), "cursor", "crosshair");
            
            /* Event handling when mouse over marker icon. */
            cc.connect("onmouseenter", function(){
            });
            cc.connect("onclick", function(event){
                var x = event.clientX - ngembryo.engine.dim.x;
                var y = event.clientY - ngembryo.engine.dim.y;
                ngembryo.engine.createRegion(grpRegion, x, y);
            });
            cc.connect("onmouseleave", function(){
            });
            cc.connect("onmousemove", function(event){
                if (ngembryo.engine.regionPoints.length > 0) {
                    var x = event.clientX - ngembryo.engine.dim.x;
                    var y = event.clientY - ngembryo.engine.dim.y;
                    
                    /**
                     * When the mouse pointer moves around the canvas, a line
                     * is drawn dynamically by joining the current mouse pointer
                     * position to the last point in the existing region polyline.
                     * Since the mouse onclick event is associated with the create
                     * canvas, we should not draw this dynamic line exactly using the
                     * current position of the mouse pointer. If this is not adjusted
                     * the mouse click event will never be triggered, since the onclick
                     * mouse event will be associated with the dynamic line. We therefore
                     * adjust the moving end of the line to not cover the create canvas.
                     */
                    var px = x;
                    var py = y;
                    var p = ngembryo.engine.regionPoints;
                    var l = ngembryo.engine.regionPoints.length - 1;
                    if (p[l].x <= px) 
                        px--;
                    else 
                        px++;
                    if (p[l].y <= py) 
                        py--;
                    else 
                        py++;
                    
                    var t = {
                        x: px,
                        y: py
                    };
                    
                    ngembryo.engine.regionPoints.push(t);
                    
                    grpRegion.clear();
                    
                    /* If this is close to the final point, highlight the first point
                     * so that a closed loop can be completed, thus defining the region.
                     */
                    if (ngembryo.engine.__isCloseToFinalPoint(x, y)) {
                        var circ = grpRegion.createCircle({
                            cx: p[0].x,
                            cy: p[0].y,
                            r: 5
                        });
                        circ.setFill([0, 0, 255, 0.3]);
                        circ.setStroke("black");
                        circ.connect("onclick", function(event){
							/* Since clicking on the circle means that the user
							 * want to conclude creating the region by closing
							 * the polyline, we ignore the current mouse, and
							 * pass the coordinates of the first point instead.
							 */
                            ngembryo.engine.createRegion(grpRegion, p[0].x, p[0].y);
                        });
                    }
                    var regionPolyline = grpRegion.createPolyline(ngembryo.engine.regionPoints);
                    regionPolyline.setStroke({
                        color: "blue"
                    });
                    ngembryo.engine.regionPoints.pop();
                }
            });
            
            /* Put a label to hint the user that creation canvas is active. */
            var ccLabel = grpCC.createText({
                x: 5,
                y: 15,
                text: grpCC.description
            });
            
            /* TODO: Better to put this separately. */
            ccLabel.setFont({
                family: "Arial",
                size: "9pt",
                style: "regular",
                weight: "bold"
            });
            //ccLabel.setStroke("#777777");
            ccLabel.setFill("#ffffff");
            
        }
        else {
            console.error("Undefined Dojo surface.");
        }
    }

		});
