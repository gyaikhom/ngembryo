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
 * @classDescription This class encapsulates a resource.
 */
var Resource = new Class(
		{
			initialize : function() {
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
								data = response.resources;
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
			 * Returns all of the resources currently registered with the
			 * system. This does not depend on the annotations. In order for a
			 * resource to be able for linking to an annotation, it must be
			 * first registered with the system.
			 */
			getAll : function() {
				return this.__get("getResources.php?format=json");
			},

			/**
			 * Destroys the resources object.
			 */
			destroy : function() {
				var ids = [ "create-resource", "resource-browser",
						"add-resource-item", "add-ralink", "resource-detail",
						"display-linked-resources" ];
				for ( var i = 0; i < ids.length; i++) {
					var temp = dijit.byId(ids[i] + "-dialog");
					if ($defined(temp)) {
						dojo.body().removeChild(temp.domNode);
						temp.destroyRecursive(false);
					}
				}
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
			 * Create a new resource.
			 * 
			 * @param flag
			 *            True if this is invoked from resource browser dialog.
			 */
			create : function(flag) {
				var crd = dijit.byId("create-resource-dialog");
				if ($defined(crd)) {
					dojo.body().removeChild(crd.domNode);
					crd.destroyRecursive(false);
				}
				crd = new dijit.Dialog( {
					id : "create-resource-dialog",
					title : "Create new resource",
					style : "width: 590px;",
					content : this.__getForm("cres.php"),
					onHide : function() {
						if (flag) {
							dojo.byId("resource-browser-dialog").focus();
						} else {
							dojo.body().removeChild(this.domNode);
							this.destroyRecursive(false);
						}
					}
				});
				dojo.body().appendChild(crd.domNode);
				var theForm = dojo.byId("cres");
				var handle = dojo.connect(theForm, "onsubmit", function(event) {
					/* prevent the form from actually submitting. */
					event.preventDefault();
					/* submit the form in the background */
					dojo.xhrPost( {
						url : "createResource.php",
						form : "cres",
						handleAs : "json",
						handle : function(data, args) {
							if (typeof data == "error") {
								console.warn("Error", args);
							}
						}
					});
					dojo.disconnect(handle);
					crd.hide();
					ngembryo.engine.refresh();
				});
				crd.startup();
				crd.show();
			},

			/**
			 * Add resource item.
			 */
			addItem : function(rid) {
				var ari = dijit.byId("add-resource-item-dialog");
				if ($defined(ari)) {
					dojo.body().removeChild(ari.domNode);
					ari.destroyRecursive(false);
				}
				ari = new dijit.Dialog( {
					id : "add-resource-item-dialog",
					title : "Create new resource",
					style : "width: 590px;",
					content : this.__getForm("crit.php?rid=" + rid),
					onHide : function() {
						dojo.byId("resource-detail-dialog").focus();
					}
				});
				dojo.body().appendChild(ari.domNode);
				var theForm = dojo.byId("crit");
				var handle = dojo.connect(theForm, "onsubmit", function(event) {
					/* prevent the form from actually submitting. */
					event.preventDefault();
					/* submit the form in the background */
					dojo.xhrPost( {
						url : "createResourceItem.php",
						form : "crit",
						handleAs : "json",
						handle : function(data, args) {
							if (typeof data == "error") {
								console.warn("Error", args);
							}
						}
					});
					ari.hide();
				});
				ari.startup();
				ari.show();
			},

			/**
			 * Adds a resource to an annotation.
			 * 
			 * @param rid
			 *            Unique identifier of the resource.
			 * @param aid
			 *            Unique identifier of the annotation.
			 * @param type
			 *            Type of the annotation.
			 */
			addToAnnotation : function(rid, aid, type) {
				dojo.xhrGet( {
					url : "addResourceToAnnotation.php?rid=" + rid + "&aid="
							+ aid + "&type=" + type,
					handleAs : "json",
					handle : function(data, args) {
						if (typeof data == "error") {
							console.warn("Error", args);
						}
					}
				});
			},

			/**
			 * Returns all of the resources that are currently available to the
			 * specified annotation for linking. This list excludes all of the
			 * resources that are already linked to the annotation.
			 * 
			 * @param aid
			 *            Unique identifier of the annotation.
			 * @param type
			 *            Annotation type.
			 * @return List of resources, or null if error or empty.
			 */
			getAvailable : function(aid, type) {
				var url = "getAnnotationResources.php?aid=" + aid + "&type="
						+ type + "&exclude=1&format=json";
				return this.__get(url);
			},

			/**
			 * Formats the available resources for display.
			 * 
			 * @param items
			 *            List of resource items.
			 * @param handler
			 *            Event handler when row is clicked.
			 */
			formatAvailable : function(aid, type) {
				var items = this.getAvailable(aid, type);
				var content = "";
				if ($defined(items) && items.length > 0) {
					content = "Click on the corresponding row to retrieve resource details.<br><br>"
							+ "<div class='resource-browser'>"
							+ "<table class='items' id='available-resources-table'>"
							+ "<tr><th>Author</th><th>Title</th><th>Abstract</th></tr>";
					for ( var i = 0; i < items.length; i++) {
						var rowClass = (i % 2) ? "oddRow" : "evenRow";
						rowClass += " clickable' "
								+ "onClick='ngembryo.resource.addToAnnotation("
								+ items[i].id
								+ ","
								+ aid
								+ ", \""
								+ type
								+ "\"); dojo.byId(\"available-resources-table\").deleteRow("
								+ (i + 1) + ");'";
						content += "<tr class='" + rowClass + "'>";
						content += "<td class='author'>" + items[i].author
								+ "</td>";
						content += "<td class='title'>" + items[i].title
								+ "</td>";
						content += "<td class='abstract'>"
								+ items[i].description + "</td>";
						content += "</tr>";
					}
					content += "</table></div>";
				} else {
					content = "No unlinked resources are currently available for this annotation."
				}
				return content;
			},

			/**
			 * Dialog for linking resources to a given annotation.
			 * 
			 * @param aid
			 *            Unique identifier for the annotation.
			 * @param type
			 *            Type of the annotation.
			 */
			linkToAnnotation : function(aid, type) {
				var arad = dijit.byId("add-ralink-dialog");
				if ($defined(arad)) {
					dojo.body().removeChild(arad.domNode);
					arad.destroyRecursive(false);
				}
				arad = new dijit.Dialog( {
					id : "add-ralink-dialog",
					title : "Add resource to annotation",
					style : "width: 70%;",
					content : this.formatAvailable(aid, type),
					onHide : function() {
						dojo.byId("display-linked-dialog").focus();
					}
				});
				dojo.body().appendChild(arad.domNode);
				arad.startup();
				arad.show();
			},

			/**
			 * Delete resource.
			 */
			deleteResource : function(e, rid, i) {
				if (!e)
					var e = window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) {
					e.stopPropagation();
					e.preventDefault();
				}
				dojo.byId("available-resources-table").deleteRow(i);
				this.__get("deleteResource.php?rid=" + rid);
				return false;
			},

			/**
			 * Formats the registered resources for display.
			 * 
			 * @param items
			 *            List of resource items.
			 * @param handler
			 *            Event handler when row is clicked.
			 */
			displayAll : function() {
				var items = this.getAll();
				var content = "";
				var buttons = "<button type='button'"
						+ " onClick='ngembryo.resource.create(true);'>"
						+ "Add resource</button> "
						+ "<button type='button'"
						+ " onClick='dijit.byId(\"resource-browser-dialog\").hide();"
						+ "'>Cancel</button>";

				if ($defined(items) && items.length > 0) {
					var content = "Click on the corresponding row to retrieve resource details.<br><br>"
							+ "<div class='resource-browser'>"
							+ "<table class='items' id='available-resources-table'>"
							+ "<tr><th>Author</th><th>Title</th><th>Abstract</th><th>Action</th></tr>";
					for ( var i = 0; i < items.length; i++) {
						var rowClass = (i % 2) ? "oddRow" : "evenRow";
						rowClass += " clickable' "
								+ "onClick='ngembryo.resource.showDetails("
								+ items[i].id + ", true);'";
						content += "<tr class='"
								+ rowClass
								+ "'>"
								+ "<td class='author'>"
								+ items[i].author
								+ "</td>"
								+ "<td class='title'>"
								+ items[i].title
								+ "</td>"
								+ "<td class='abstract'>"
								+ items[i].description
								+ "</td>"
								+ "<td><button type='button'"
								+ " onClick='ngembryo.resource.deleteResource(event, "
								+ items[i].id + ", " + (i + 1)
								+ ");'>delete</button></td></tr>";
					}
					content += "</table></div><br>" + buttons;
				} else {
					content = "No resources are currently registered with the system.<br><br>"
							+ buttons
				}
				return content;
			},

			/**
			 * Lists all of the available resources.
			 */
			list : function() {
				var rbd = dijit.byId("resource-browser-dialog");
				if ($defined(rbd)) {
					dojo.body().removeChild(rbd.domNode);
					rbd.destroyRecursive(false);
				}
				var rbd = new dijit.Dialog( {
					id : "resource-browser-dialog",
					title : "Registered resources",
					style : "width: 70%;",
					onFocus : function() {
						rbd.attr( {
							content : this.displayAll()
						});
					}.bind(this)
				});
				dojo.body().appendChild(rbd.domNode);
				rbd.startup();
				rbd.show();
			},

			/**
			 * Retrieves resource details.
			 * 
			 * @param id
			 *            Unique identifier of the resource.
			 */
			getDetails : function(id) {
				return this.__get("getResources.php?format=json&rid=" + id);
			},

			/**
			 * Delete resource item.
			 */
			deleteItem : function(rid, iid) {
				return this.__get("deleteResourceItem.php?rid=" + rid + "&iid="
						+ iid);
			},

			/**
			 * Format resource details.
			 * 
			 * @param id
			 *            Unique identifier of the resource.
			 * @param flag
			 *            True if new items can be added to the resource.
			 */
			formatDetails : function(id, flag) {
				var items = this.getDetails(id);
				var content = "";
				var buttons = "<table width=100% border=0><tr>";

				if (flag) {
					buttons += "<td><button type='button'"
							+ " onClick='ngembryo.resource.addItem("
							+ items[0].id + ");'>Add item</button> ";
				}
				buttons += "<button type='button'"
					+ " onClick='dijit.byId(\"resource-detail-dialog\").hide();"
					+ "'>Cancel</button></td>"		
					+ "<td align=right><button type='button'"
					+ " onClick='ngembryo.resource.__get(\"deleteResource.php?rid="
					+ id + "\");ngembryo.engine.refresh();"
					+ "dijit.byId(\"resource-detail-dialog\").hide();"
					+ "'>Delete resource</button></td></tr></table>";

				if ($defined(items) && items.length > 0) {
					content = "<table class='details'>";
					content += "<tr><td class='label'>Author:</td><td class='value author'>"
							+ items[0].author + "</td></tr>";
					content += "<tr><td class='label'>Title:</td><td class='value title'>"
							+ items[0].title + "</td></tr>";
					content += "<tr><td class='label'>Abstract:</td><td class='value abstract'>"
							+ items[0].description + "</td></tr>";
					content += "</table><br>";

					var ritems = items[0].resourceItems;
					if ($defined(ritems)) {
						content += "List of resource items:<br>"
								+ "<div class='resource-item-browser'><table class='items' id='available-resource-items-table'>"
								+ "<tr><th>Title</th><th>Abstract</th><th>Mime-type</th><th>Link</th><th>Action</th></tr>";
						for ( var i = 0; i < ritems.length; i++) {
							var rowClass = (i % 2) ? "oddRow" : "evenRow";
							content += "<tr class='"
									+ rowClass
									+ "'><td class='title'>"
									+ ritems[i].title
									+ "</td><td class='abstract'>"
									+ ritems[i].description
									+ "</td><td class='mime'>"
									+ ritems[i].mime
									+ "</td><td class='link'><a href='"
									+ ritems[i].link
									+ " 'target='_blank'>open</a></td>"
									+ "<td><button type='button'"
									+ " onClick='ngembryo.resource.deleteItem("
									+ items[0].id
									+ ","
									+ ritems[i].id
									+ "); dojo.byId(\"available-resource-items-table\").deleteRow("
									+ (i + 1) + ");'>delete</button></td></tr>";
						}
						content += "</table></div>";
					} else {
						content += "This resource does not contain any resource item.";
					}
					content += "<br><br>" + buttons;
				} else {
					content = "Resource details are currently unavailable.";
				}
				return content;
			},

			/**
			 * Shows resource detail.
			 * 
			 * @param id
			 *            Unique identifier of the resource.
			 * @param flag
			 *            True if new items can be added to the resource.
			 */
			showDetails : function(id, flag) {
				var rdd = dijit.byId("resource-detail-dialog");
				if ($defined(rdd)) {
					dojo.body().appendChild(rdd.domNode);
					rdd.destroyRecursive(false);
				}
				var rdd = new dijit.Dialog( {
					id : "resource-detail-dialog",
					title : "Resource details",
					style : "width: 70%;",
					onHide : function() {
						if (flag) {
							dojo.byId("resource-browser-dialog").focus();
						} else {
							dojo.byId("display-linked-dialog").focus();
						}
					},
					onFocus : function() {
						rdd.attr( {
							content : this.formatDetails(id, flag)
						});
					}.bind(this)
				});
				dojo.body().appendChild(rdd.domNode);
				rdd.startup();
				rdd.show();
			},

			/**
			 * Returns all of the resources that are currently linked to the
			 * specified annotation.
			 * 
			 * @param aid
			 *            Unique identifier of the annotation.
			 * @param type
			 *            Annotation type.
			 * @return List of resources, or null if error or empty.
			 */
			getLinked : function(aid, type) {
				var url = "getAnnotationResources.php?aid=" + aid + "&type="
						+ type + "&exclude=0&format=json";
				return this.__get(url);
			},

			/**
			 * Formats the linked resources for display.
			 * 
			 * @param aid
			 *            Unique identifier of the annotation.
			 * @param type
			 *            Annotation type.
			 * @param label
			 *            Annotation label.
			 * @param description
			 *            Description of the annotation.
			 */
			formatLinked : function(aid, type, label, description) {
				var items = this.getLinked(aid, type);
				var buttons = "<table width=100% border=0><tr>"
						+ "<td><button type='button'"
						+ " onClick='ngembryo.resource.linkToAnnotation("
						+ aid
						+ ", \""
						+ type
						+ "\");"
						+ "'>Add resource</button> "
						+ "<button type='button'"
						+ " onClick='dijit.byId(\"display-linked-dialog\").hide();"
						+ "'>Cancel</button></td>"
						+ "<td align=right><button type='button'"
						+ " onClick='ngembryo.resource.__get(\"deleteAnnotation.php?aid="
						+ aid + "&type=" + type
						+ "\");ngembryo.engine.refresh();"
						+ "dijit.byId(\"display-linked-dialog\").hide();"
						+ "'>Delete annotation</button></td></tr></table>";
				var content = "<b>Label:</b> " + label
						+ "<br><b>Description:</b> " + description;
				if ($defined(items) && items.length > 0) {
					content += "<br><br>The following resources are currently linked to this annotation.<br><div class='resource-browser'>"
							+ "<table class='items'>";
					+"<tr><th>Author</th><th>Title</th><th>Abstract</th></tr>";
					for ( var i = 0; i < items.length; i++) {
						var rowClass = (i % 2) ? "oddRow" : "evenRow";
						rowClass += " clickable' "
								+ "onClick='ngembryo.resource.showDetails("
								+ items[i].id + ", false);'";
						content += "<tr class='" + rowClass + "'>"
								+ "<td class='author'>" + items[i].author
								+ "</td>" + "<td class='title'>"
								+ items[i].title + "</td>"
								+ "<td class='abstract'>"
								+ items[i].description + "</td>" + "</tr>";
					}
					content += "</table></div><br>" + buttons;
				} else {
					content += "<br><br>This annotation is not liked to any of the available resources.<br><br>"
							+ buttons;
				}
				return content;
			},

			/**
			 * List all of the resources for a given annotation.
			 * 
			 * @param aid
			 *            Unique identifier for the annotation.
			 * @param type
			 *            Type of the annotation.
			 * @param label
			 *            Annotation label.
			 * @param description
			 *            Description of the annotation.
			 */
			displayLinked : function(aid, type, label, description) {
				srd = new dijit.Dialog( {
					id : "display-linked-dialog",
					title : "Show resources",
					style : "width: 70%;",
					onHide : function() {
						dojo.body().removeChild(this.domNode);
						this.destroyRecursive(false);
					},
					onFocus : function() {
						srd.attr( {
							content : this.formatLinked(aid, type, label,
									description)
						});
					}.bind(this)
				});
				dojo.body().appendChild(srd.domNode);
				srd.startup();
				srd.show();
			},

			/**
			 * Displays the resources associated with an annotation.
			 */
			__old_showResources : function(id, label, description, type) {
				this.setResourceGrid(id, label, description, type);
				dialog.show();
			},

			/**
			 * Retrieve resource information from the repository.
			 */
			__old_setResourceGrid : function(id, label, description, type) {
				var store = new dojox.data.CsvStore( {
					url : "getAnnotationResources.php?aid=" + id + "&type="
							+ type + "&exclude=0&format=csv"
				});
				var layout = [ {
					field : 'id',
					name : 'id',
					width : '20px'
				}, {
					field : 'author',
					name : 'author',
					width : '200px'
				}, {
					field : 'title',
					name : 'title',
					width : '200px'
				}, {
					field : 'abstract',
					name : 'abstract',
					width : 'auto'
				}, {
					field : 'url',
					name : 'url',
					width : '200px'
				} ];
				var grid = new dojox.grid.DataGrid( {
					query : {
						id : '*'
					},
					store : store,
					clientSort : true,
					rowSelector : '20px',
					structure : layout
				});

				var c = dojo.create("div", {
					id : "resourceContent"
				});
				var d = dojo.create("div", {
					id : "resourceDescription",
					innerHTML : "<b>Description: </b>" + description
				});
				c.appendChild(d);
				var actions = dojo.create("div", {
					id : "resourceActions",
					innerHTML : "<img src='' alt='Add resource'"
							+ " onClick='ngembryo.resource.linkToAnnotation("
							+ id + ", \"" + type + "\");'>"
				});
				c.appendChild(actions);
				var t = dojo.create("div", {
					id : "resourceGrid"
				});
				t.appendChild(grid.domNode);
				c.appendChild(t);
				grid.startup();

				dialog.attr( {
					title : label,
					style : "height: 500px; width: 50%;",
					content : c
				});
			}

		});
