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
 * @classDescription This class encapsulates layers.
 * 
 * Layers are assigned to an orientation for a given model. This class
 * encapsulates the methods for retrieving layers which belong to a model at the
 * given orientation.
 */
var Layer = new Class(
		{
			initialize : function() {
				this.refresh();
			},

			/**
			 * This retrieves data according to the supplied url. This is a
			 * low-level function.
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
								/* As yet, no feedback. */
							} else {
								console.error("Error (" + response.errcode
										+ "): Server did not respond.");
							}
						} else {
							console.error("Server did not respond.");
						}
					}.bind(this),
					error : function(response, ioArgs) {
						console.error("HTTP status code: ", ioArgs.xhr.status);
					}
				});
				return data;
			},

			/**
			 * Refreshes the list of layers that are available for the
			 * orientations parameters as currently set on the controls panel.
			 */
			refresh : function() {
				//this.items = null;
				ngembryo.oid = -1;
				var model = ngembryo.mid;
				var dst = dojo.byId("dstValue").value;
				var yaw = dojo.byId("yawValue").value;
				var pit = dojo.byId("pitchValue").value;
				var rol = dojo.byId("rollValue").value;
				dojo.xhrGet( {
					url : "getLayers.php?model=" + model + "&distance=" + dst
							+ "&yaw=" + yaw + "&roll=" + rol + "&pitch=" + pit
							+ "&format=json",
					handleAs : "json",
					sync : true,
					timeout : 5000, /* Time in milliseconds. */
					load : function(response, ioArgs) {
						if ($defined(response)) {
							if (response.success) {
								/* Check current visibility settings. */
								if ($defined(this.items)) {
									for (var i = 0; i < this.items.length; i++) {
										for (var j = 0; j < response.layers.length; j++) {
											if (this.items[i].id == response.layers[j].id) {
												response.layers[j].visible = this.items[i].visible;
												break;
											}
										}	
									}
								}
								this.items = response.layers;
								if ($defined(this.items)
										&& this.items.length > 0) {
									if (ngembryo.lid == -1) {
										ngembryo.lid = this.items[0].id;
										this.select(ngembryo.lid);
									}
								} else
									ngembryo.lid = -1;
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
			 * Destroys the layers object.
			 */
			destroy : function() {
				var lbd = dijit.byId("layer-browser-dialog");
				if ($defined(lbd)) {
					dojo.body().removeChild(lbd.domNode);
					lbd.destroyRecursive(false);
				}
				var cld = dijit.byId("create-layer-dialog");
				if ($defined(cld)) {
					dojo.body().removeChild(cld.domNode);
					cld.destroyRecursive(false);
				}
				ngembryo.lid = -1;
			},

			/**
			 * Format form for layer creation.
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
			 * Creates a new layer at the current orientation.
			 * 
			 * @param flag
			 *            True if this is invoked from layer browser dialog.
			 */
			create : function(flag) {
				var cld = dijit.byId("create-layer-dialog");
				if ($defined(cld)) {
					dojo.body().removeChild(cld.domNode);
					cld.destroyRecursive(false);
				}
				var model = ngembryo.mid;
				var distance = dojo.byId("dstValue").value;
				var yaw = dojo.byId("yawValue").value;
				var pitch = dojo.byId("pitchValue").value;
				var roll = dojo.byId("rollValue").value;
				var url = "clay.php?model=" + model + "&distance=" + distance
						+ "&yaw=" + yaw + "&roll=" + roll + "&pitch=" + pitch;
				cld = new dijit.Dialog( {
					id : "create-layer-dialog",
					title : "Create new layer",
					style : "width: 590px;",
					content : this.__getForm(url),
					onHide : function() {
						if (flag) {
							dojo.byId("layer-browser-dialog").focus();
						} else {
							dojo.body().removeChild(cld.domNode);
							cld.destroyRecursive(false);
						}
					}
				});
				dojo.body().appendChild(cld.domNode);
				var theForm = dojo.byId("clay");
				var handle = dojo.connect(theForm, "onsubmit", function(event) {
					/* prevent the form from actually submitting. */
					event.preventDefault();
					/* submit the form in the background */
					dojo.xhrPost( {
						url : "createLayer.php",
						form : "clay",
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
					cld.hide();
					ngembryo.engine.refresh();
				});
				cld.startup();
				cld.show();
			},

			/**
			 * Hide/Display layer.
			 */
			toggleLayerVisibility : function(e, index, elem) {
				if (!e)
					var e = window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) {
					e.stopPropagation();
				}
				this.items[index].visible = !this.items[index].visible;
				elem.checked = this.items[index].visible;
				if (this.items[index].id == ngembryo.lid)
					ngembryo.lid = -1;
				ngembryo.engine.refresh();
			},

			/**
			 * Show/Hide all layers.
			 */
			setAllLayersVisibility : function(flag) {
				for ( var i = 0; i < this.items.length; i++) {
					this.items[i].visible = flag;
					var elem = dojo.byId("layer-visibility-checkbox-" + i);
					elem.checked = flag;
					if (flag)
						ngembryo.lid = 0;
					else
						ngembryo.lid = -1;
				}
				ngembryo.engine.refresh();
			},

			/**
			 * Delete layer.
			 */
			deleteLayer : function(e, lid, i) {
				confirmDialog("Delete layer",
						"Deleting a layer will also delete all "
								+ "of the associated annotations. "
								+ "Do you wish to continue?", function(flag) {
							if (flag) {
								dojo.byId("available-layers-table")
										.deleteRow(i);
								ngembryo.layer.__get("deleteLayer.php?lid="
										+ lid);
								if (lid == ngembryo.lid)
									ngembryo.lid = -1;
								ngembryo.layer.refresh();
								ngembryo.engine.refresh();
							}
						}, function() {
							dojo.byId("layer-browser-dialog").focus();
						}, e);
				return false;
			},

			/**
			 * Formats the available layers for display.
			 */
			formatLayers : function() {
				ngembryo.layer.refresh();
				var content = "";
				var isVisible;
				var items = ngembryo.layer.items;
				var buttons = "<button type='button'"
						+ " onClick='ngembryo.layer.create(true);'>"
						+ "Add layer</button> "
						+ "<button type='button'"
						+ " onClick='dijit.byId(\"layer-browser-dialog\").hide();"
						+ "'>Cancel</button>";

				if ($defined(items)) {
					var content = "Click on the layer to select. Currently "
							+ "selected layer is highlighted.<br><br>"
							+ "Set visibility of all layers: <button type='button'"
							+ " onClick='ngembryo.layer.setAllLayersVisibility(true);'>Show all</button>"
							+ "<button type='button'"
							+ " onClick='ngembryo.layer.setAllLayersVisibility(false);'>Hide all</button>"
							+ "<br><div class='layer-browser'>"
							+ "<table class='items' id='available-layers-table'>"
							+ "<tr><th>Title</th><th>Description</th><th>Visibility"
							+ "</th><th>Action</th></tr>";
					for ( var i = 0; i < items.length; i++) {
						var rowClass = (i % 2) ? "oddRow" : "evenRow";
						var selected = (items[i].id == ngembryo.lid) ? true
								: false;
						rowClass += selected ? " selected'"
								: " clickable' onClick='ngembryo.layer.select("
										+ items[i].id + ");'";
						isVisible = (items[i].visible) ? "checked" : "";
						content += "<tr class='"
								+ rowClass
								+ ">"
								+ "<td class='title'>"
								+ items[i].title
								+ "</td>"
								+ "<td class='abstract'>"
								+ items[i].description
								+ "</td><td><input type='checkbox' "
								+ "id='layer-visibility-checkbox-"
								+ i
								+ "' "
								+ isVisible
								+ " onClick='ngembryo.layer.toggleLayerVisibility(event, "
								+ i
								+ ", this);'></td>"
								+ "</td><td><button type='button'"
								+ " onClick='ngembryo.layer.deleteLayer(event, "
								+ items[i].id + ", " + (i + 1)
								+ ");'>delete</button></td></tr>";
					}
					content += "</table></div><br>" + buttons;
				} else {
					content = "No layers are currently registered for this "
							+ "orientation. Please create a new layer, or "
							+ "select a different orientation.<br><br>"
							+ buttons;
				}
				return content;
			},

			/**
			 * Displays all of the layers that are currently available for this
			 * orientation. The orientation is determined by the values
			 * currently set on the controls panel. Note that the orientation
			 * parameters are not affected by previously selected orientations.
			 */
			display : function() {
				var lbd = dijit.byId("layer-browser-dialog");
				if ($defined(lbd)) {
					dojo.body().removeChild(lbd.domNode);
					lbd.destroyRecursive(false);
				}
				lbd = new dijit.Dialog( {
					id : "layer-browser-dialog",
					title : "Select layer",
					style : "width: 70%;",
					onHide : function() {
						dojo.body().removeChild(lbd.domNode);
						lbd.destroyRecursive(false);
					},
					onFocus : function() {
						lbd.attr( {
							content : this.formatLayers()
						});
					}.bind(this)
				});
				dojo.body().appendChild(lbd.domNode);
				lbd.startup();
				lbd.show();
			},

			/**
			 * Selects the supplied layer.
			 * 
			 * @param id
			 *            Unique identifier of the layer to select.
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
					/* If the identifier was found, continue. */
					if (index != -1) {
						ngembryo.lid = id;
						dijit.byId("layer-browser-dialog").hide();
						ngembryo.refresh();
					}
				}
			},

			/**
			 * Check if the layer id is valid. If not valid, show a dialog box
			 * asking user to select layer.
			 */
			checkLayer : function() {
				if (!$defined(ngembryo.lid) || ngembryo.lid == -1) {
					var ild = new dijit.Dialog(
							{
								id : "invalid-layer-dialog",
								title : "Invalid layer",
								content : "<div align='left'>"
										+ "No layer has been selected. "
										+ "Please select a layer using the layer menu on the toolbar.<br><br>"
										+ "<button type='button'"
										+ " onClick='dijit.byId"
										+ "(\"invalid-layer-dialog\").hide();"
										+ "'>Ok</button></div>",
								onHide : function() {
									dojo.body().removeChild(ild.domNode);
									ild.destroyRecursive(false);
								}
							});
					dojo.body().appendChild(ild.domNode);
					ild.startup();
					ild.show();
					return false;
				} else {
					return true;
				}
			}
		});
