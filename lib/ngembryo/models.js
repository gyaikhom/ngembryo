/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */
/**
 * @classDescription This class encapsulates NGEbmryo models.
 * 
 * This stores all of the data related to models.
 */
var Models = new Class( {
	initialize : function() {
		dojo.xhrGet( {
			url : "getModels.php?format=json",
			handleAs : "json",
			sync: true,
			timeout : 5000, /* Time in milliseconds. */
			load : function(response, ioArgs) {
				this.item = response;
			}.bind(this),
			error : function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
				return response;
			}
		});
	},

    destroy : function() {
    	
    },
    
	createEmbryoModel : function(id) {
		if ($defined(woolz)) {
			woolz.destroy();
			woolz = null;
		}
		if ($defined(ngembryo.orientation)) {
			ngembryo.orientation.destroy();
			ngembryo.orientation = null;
		}
        if ($defined(ngembryo.layer)) {
            ngembryo.layer.destroy();
            ngembryo.layer = null;
        }
		if ($defined(ngembryo.controlManager)) {
			ngembryo.controlManager.destroy();
			ngembryo.controlManager = null;
		}
		//ngembryo.engine.detachDraggingEvent();		
		//ngembryo.engine.detachScrollEvent();
		if ($defined(ngembryo.resize)) {
			dojo.disconnect(ngembryo.resize);
		}
		ngembryo.controlManager = new ControlManager( {
			zoom : true,
			dst : true,
			navigator : true,
			roi : true,
			sec : true
		});
		this.item[id].source = "woolztargetframe";
		woolz = new WlzIIPViewer(this.item[id]);
		ngembryo.mid = this.item[id].id;
		ngembryo.orientation = new Orientation();
		ngembryo.layer = new Layer();
		ngembryo.controlManager.startup();
		//ngembryo.engine.attachScrollEvent();
		//ngembryo.engine.attachDraggingEvent();
		ngembryo.resize = dojo.connect(window, "onresize", function() {
			woolz.model.setViewportSize(window.getWidth(), window.getHeight());
			ngembryo.refresh();
		});
		ngembryo.refresh();
	}
});
