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
 * @classDescription This class encapsulates model orientation.
 * 
 * This stores all of the data to orient a model.
 */
var Orientation = new Class( {
	initialize : function() {
		this.refresh();
	},

	/**
	 * Refreshes the list of orientations for the current model.
	 */
	refresh : function() {
		this.items = null;
		dojo.xhrGet( {
			url : "getOrientations.php?model=" + ngembryo.mid + "&format=json",
			handleAs : "json",
			sync : true,
			timeout : 5000, /* Time in milliseconds. */
			load : function(response, ioArgs) {
				if ($defined(response)) {
					if (response.success) {
						this.items = response.orientations;
					}
				}
			}.bind(this),
			error : function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
				return response;
			}
		});
	},

	/**
	 * Destroys the orientations object.
	 */
	destroy : function() {
		var obd = dijit.byId("orientation-browser-dialog");
		if ($defined(obd))
			obd.destroyRecursive(false);
		ngembryo.oid = -1;
	},

	/**
	 * Format form for resource creation.
	 */
	__getForm : function(url) {
		var form = null;
		dojo.xhrGet( {
			url : url,
			handleAs : "text",
			sync : true,
			timeout : 5000, /* Time in milliseconds. */
			load : function(response, ioArgs) {
				form = response;
			},
			error : function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
			}
		});
		return form;
	},

	/**
	 * Create a new orientation object.
	 * 
	 * @param flag
	 *            True if this is invoked from orientation browser dialog.
	 */
	create : function(flag) {
		var cod = dijit.byId("create-orientation-dialog");
		if ($defined(cod)) {
			dojo.body().removeChild(cod.domNode);
			cod.destroyRecursive(false);
		}
		var model = ngembryo.mid;
		var distance = dojo.byId("dstValue").value;
		var yaw = dojo.byId("yawValue").value;
		var pitch = dojo.byId("pitchValue").value;
		var roll = dojo.byId("rollValue").value;
		var url = "cori.php?model=" + model + "&distance=" + distance + "&yaw="
				+ yaw + "&roll=" + roll + "&pitch=" + pitch;
		var cod = new dijit.Dialog( {
			id : "create-orientation-dialog",
			title : "Create new orientation",
			style : "width: 590px;",
			content : this.__getForm(url),
			onHide : function() {
				if (flag) {
					dojo.byId("orientation-browser-dialog").focus();
				} else {
					dojo.body().removeChild(cod.domNode);
					this.destroyRecursive(false);
				}
			}
		});
		dojo.body().appendChild(cod.domNode);
		var model = ngembryo.mid;
		var distance = dojo.byId("dstValue").value;
		var yaw = dojo.byId("yawValue").value;
		var pitch = dojo.byId("pitchValue").value;
		var roll = dojo.byId("rollValue").value;
		var theForm = dojo.byId("cori");
		var handle = dojo.connect(theForm, "onsubmit", function(event) {
			/* prevent the form from actually submitting. */
			event.preventDefault();
			/* submit the form in the background */
			dojo.xhrPost( {
				url : "createOrientation.php",
				form : "cori",
				handleAs : "json",
				handle : function(data, args) {
					if (typeof data == "error") {
						console.warn("Error", args);
					} else {
						console.log(data);
						this.refresh();
					}
				}
			});
			dojo.disconnect(handle);
			cod.hide();
			ngembryo.engine.refresh();
		});
		cod.startup();
		cod.show();
	},

	/**
	 * Formats available orientations for display.
	 */
	formatOrientations : function() {
		ngembryo.orientation.refresh();
		var content = "";
		var buttons = "<button type='button'"
			+ " onClick='ngembryo.orientation.create(true);'>"
			+ "Add orientation</button> " + "<button type='button'"
			+ " onClick='dijit.byId"
			+ "(\"orientation-browser-dialog\").hide();"
			+ "'>Cancel</button>";

		var items = ngembryo.orientation.items;
		if ($defined(items) && items.length > 0) {
			/*
			 * This determines the size of the images displayed inside the
			 * orientation browser.
			 */
			var scale = 0.15;
			var navsrc = woolz.locator.server + '?' + woolz.model.fif + "&mod="
					+ woolz.model.mode + "&fxp=" + woolz.model.fxp.x + ','
					+ woolz.model.fxp.y + ',' + woolz.model.fxp.z + "&scl="
					+ scale;

			var content = "Click on the model to select. Currently selected model is highlighted.<br><br><div class='orientation-browser'>"
					+ "<table class='items'>"
					+ "<tr><th>Preview</th><th>Parameters</th></tr>";
			for ( var i = 0; i < items.length; i++) {
				var rowClass = (i % 2) ? "oddRow" : "evenRow";
				var selected = (items[i].id == ngembryo.oid) ? true : false;
				rowClass += selected ? " selected'"
						: " clickable' onClick='ngembryo.orientation.select("
								+ items[i].id + ");'";
				var k = navsrc + "&dst=" + items[i].distance * scale + "&pit="
						+ items[i].pitch + "&yaw=" + items[i].yaw + "&rol="
						+ items[i].roll + "&qlt=" + woolz.model.qlt.cur
						+ '&cvt=jpeg';

				content += "<tr class='" + rowClass + "><td>"
						+ "<img style='background: #000000;'"
						+ " height='100px' src='" + k + "' alt='"
						+ items[i].title + "'></img></td><td><table>"
						+ "<tr><td class='label'>Distance:</td>"
						+ "<td class='value'>" + items[i].distance
						+ "</td></tr>" + "<tr><td class='label'>Yaw:</td>"
						+ "<td class='value'>" + items[i].yaw + "</td></tr>"
						+ "<tr><td class='label'>Pitch:</td>"
						+ "<td class='value'>" + items[i].pitch + "</td></tr>"
						+ "<tr><td class='label'>Roll:</td>"
						+ "<td class='value'>" + items[i].roll
						+ "</td></tr></table></td></tr>";
			}
			content += "</table></div><br>" + buttons;
		} else {
			content = "There are no registered orientations.<br>" + buttons;
		}
		return content;
	},

	/**
	 * Displays all of the orientations available for this model.
	 */
	display : function() {
		var obd = dijit.byId("orientation-browser-dialog");
		if ($defined(obd)) {
			dojo.body().removeChild(obd.domNode);
			obd.destroyRecursive(false);
		}
		obd = new dijit.Dialog( {
			id : "orientation-browser-dialog",
			title : "Select orientation",
			onHide : function() {
				dojo.body().removeChild(obd.domNode);
				obd.destroyRecursive(false);
			},
			onFocus : function() {
				obd.attr( {
					content : this.formatOrientations()
				});
			}.bind(this)
		});

		dojo.body().appendChild(obd.domNode);
		obd.startup();
		obd.show();
	},

	/**
	 * Selects the orientation with the specified identifier.
	 * 
	 * @param id
	 *            Unique identifier of the orientation.
	 */
	select : function(id) {
		if ($defined(this.items)) {
			var index = -1;
			for ( var i = 0; i < this.items.length; i++) {
				if (this.items[i].id == id) {
					index = i;
					break;
				}
			}
			if (index != -1) {
				ngembryo.controlManager
						.setDistanceValue(this.items[i].distance);
				ngembryo.controlManager.setYawValue(this.items[i].yaw);
				ngembryo.controlManager.setPitchValue(this.items[i].pitch);
				ngembryo.controlManager.setRollValue(this.items[i].roll);
				ngembryo.layer.refresh();
				ngembryo.refresh();
				dijit.byId("orientation-browser-dialog").hide();
				ngembryo.oid = id;
			}
		}
	}
});
