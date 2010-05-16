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
 * @classDescription This class encapsulates the NGEbmryo web application.
 */
var NGEmbryo = new Class( {
	/**
	 * Initialises the ngembryo portal.
	 */
	initialize : function() {
		/*
		 * This is for controlling event handling. setByUser is set to true if
		 * the event was raised by user intervention. otherwise, it is set to
		 * false. This resolves recursive event handling where event trigger
		 * each other circularly.
		 */
		this.setByUser = true;
		this.controlReady = false;

		/* Check integrity of the annotation server. */
		faulty = false;
		var checkServerStatus = function(data) {
			if (data.success == false) {
				faulty = true;
				console.warn(data.message);
				d = new dijit.Dialog( {
					id : "errorDialog",
					title : "Failed to initialise the annotation engine",
					style : "height: 100px; width: 400px;",
					content : "<div align='left' style='color: #ff0000;"
							+ "height: 450px; overflow: auto;'>" + data.message
							+ "<p>Contact administrator at: </p></div>"
				});
				dojo.body().appendChild(d.domNode);
				d.startup();
				d.show();
			}
		};

		dojo.xhrGet( {
			url : "checkIntegrity.php",
			handleAs : "json",
			timeout : 5000, /* Time in milliseconds. */
			sync : true,
			load : checkServerStatus,
			error : function(error) {
				console.info(error);
			}
		});

		if (faulty) {
			this.faulty = true;
			return null;
		}
		this.engine = new AnnotationEngine("annot");
		this.dialogManager = new DialogManager();
		var app = new dijit.layout.BorderContainer( {
			id : "ngembryo-application",
			design : "headline",
			gutters : "false"
		});
		this.models = new Models();
		this.toolbar = new Toolbar(app, this.engine, this.models);
		this.content = new Content(app);
		dojo.body().appendChild(app.domNode);
		app.startup();
	},

	/**
	 * Starts the application.
	 */
	start : function() {
		ngembryo.resource = new Resource();
		this.engine.start();
	},

	destroy : function() {
		this.content.destroy();
		this.models.destroy();
		this.resource.destroy();
		this.toolbar.destroy();
		this.dialogManager.destroy();
		this.engine.destroy();
		var app = dojo.byId("ngembryo-application");
		if ($defined(app)) {
			dojo.body().removeChild(app.domNode);
			app.destroyRecursive(false);
		}

		/* Clean up any remaining DOM element. */
		destroyChildSubtree(dojo.body());
	},

	refresh : function() {
		this.engine.refresh();
	}
});
