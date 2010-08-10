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
		this.old_oid = -1;
		this.refresh();
	},

	/**
	 * This retrieves data according to the supplied url. This is a low-level
	 * function.
	 */
	__get : function(url) {
		var data = null;
		dojo.xhrGet( {
			url : url,
			handleAs : "json",
			sync : true,
			timeout : 5000, /* Time in milliseconds. */
			load : function(response, ioArgs) {
				if ($defined(response)) {
					if (response.success) {
						ngembryo.content.feedback
								.show("info", response.message);
					} else {
						ngembryo.content.feedback
								.show("warn", response.message);
					}
				} else {
					ngembryo.content.feedback.show("error",
							"Server did not respond");
				}
			}.bind(this),
			error : function(response, ioArgs) {
				ngembryo.content.feedback.show("error", "HTTP status code ("
						+ ioArgs.xhr.status + ") : Failure to"
						+ " process server response");
			}
		});
		return data;
	},

	/**
	 * Refreshes the list of orientations for the current model.
	 */
	refresh : function() {
		this.items = null;
		dojo.xhrGet( {
			url : "go.php?model=" + ngembryo.mid,
			handleAs : "json",
			sync : true,
			timeout : 5000, /* Time in milliseconds. */
			load : function(response, ioArgs) {
				if ($defined(response)) {
					if (response.success) {
						this.items = response.o;
					}
				}
			}.bind(this),
			error : function(response, ioArgs) {
				ngembryo.content.feedback.show("error", "HTTP status code ("
						+ ioArgs.xhr.status + ") : Failure to"
						+ " process server response");
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
		var url = "coF.php?model=" + model + "&distance=" + distance + "&yaw="
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
			/*
			 * prevent the form from actually submitting.
			 */
			event.preventDefault();
			/* submit the form in the background */
			dojo.xhrPost( {
				url : "co.php",
				form : "cori",
				handleAs : "json",
				load : function(response, ioArgs) {
					if ($defined(response)) {
						if (response.success) {
							ngembryo.content.feedback.show("info",
									response.message);
						} else {
							ngembryo.content.feedback.show("warn",
									response.message);
						}
					}
				}.bind(this),
				error : function(response, ioArgs) {
					ngembryo.content.feedback.show("error",
							"HTTP status code (" + ioArgs.xhr.status
									+ ") : Failure to"
									+ " process server response");
					return response;
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
	 * Delete orientation.
	 */
	deleteOrientation : function(e, oid, i) {
		confirmDialog("Delete orientation",
				"Deleting an orientation will also "
						+ "delete all of the layers in that "
						+ "orientation, including all of the "
						+ "annotations associated in that layer. "
						+ "Do you wish to continue?", function(flag) {
					if (flag) {
						dojo.byId("available-orientations-table").deleteRow(i);
						ngembryo.orientation.__get("do.php?oid=" + oid);
						if (oid == ngembryo.oid)
							ngembryo.oid = -1;
						ngembryo.orientation.refresh();
						ngembryo.layer.refresh();
						ngembryo.engine.refresh();
					}
				}, function() {
					dojo.byId("orientation-browser-dialog").focus();
				}, e);
		return false;
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

			var content = "Click on the model to select."
					+ " Currently selected model is "
					+ "highlighted.<br><br><div class='orientation-browser'>"
					+ "<table class='items' id='available-orientations-table'>"
					+ "<tr><th>Preview</th><th>Parameters</th></tr>";
			for ( var i = 0; i < items.length; i++) {
				var rowClass = (i % 2) ? "oddRow" : "evenRow";
				var selected = (items[i].id == ngembryo.oid) ? true : false;
				rowClass += selected ? " selected'"
						: " clickable' onClick='ngembryo.orientation.select("
								+ items[i].id + ");'";
				var k = navsrc + "&dst=" + items[i].ds * scale + "&pit="
						+ items[i].p + "&yaw=" + items[i].y + "&rol="
						+ items[i].r + "&qlt=" + woolz.model.qlt.cur
						+ '&cvt=jpeg';

				content += "<tr class='" + rowClass + "><td>"
						+ "<img style='background: #000000;'"
						+ " height='100px' src='" + k + "' alt='" + items[i].t
						+ "'></img></td><td>Title: " + items[i].t
						+ "<br>Distance: " + items[i].ds + ", Yaw: "
						+ items[i].y + "<br>Pitch: " + items[i].p + ", Roll: "
						+ items[i].r + "<br><br><button type='button'"
						+ " onClick='ngembryo.orientation"
						+ ".deleteOrientation(event, " + items[i].id + ", "
						+ (i + 1) + ");'>delete</button></td></tr>";
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
	select : function(id, flag) {
		if ($defined(this.items)) {
			var index = -1;
			for ( var i = 0; i < this.items.length; i++) {
				if (this.items[i].id == id) {
					index = i;
					break;
				}
			}
			if (index != -1) {
				ngembryo.controlManager.setDistanceValue(this.items[i].ds);
				ngembryo.controlManager.setYawValue(this.items[i].y);
				ngembryo.controlManager.setPitchValue(this.items[i].p);
				ngembryo.controlManager.setRollValue(this.items[i].r);
				var t = dijit.byId("orientation-browser-dialog");
				if ($defined(t))
					t.hide();
				ngembryo.oid = id;
				ngembryo.layer.refresh();
				ngembryo.refresh();
				ngembryo.content.feedback.show("info", "Orientation '"
						+ this.items[index].t + "' has been selected.");
			}
		}
	}
});
