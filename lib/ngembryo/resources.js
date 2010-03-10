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
			 */
			create : function() {
				var crd = new dijit.Dialog( {
					id : "create-resource-dialog",
					title : "Create new resource",
					style : "width: 590px;",
					content : this.__getForm("cres.php"),
					onHide : function() {
						dojo.body().removeChild(this.domNode);
						this.destroyRecursive(false);
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
					var content = "<table class='items'>";
					content += "<tr><th>Author</th><th>Title</th><th>Abstract</th></tr>";
					for ( var i = 0; i < items.length; i++) {
						var rowClass = (i % 2) ? "oddRow" : "evenRow";
						rowClass += " clickable' "
								+ "onClick='ngembryo.resource.addToAnnotation("
								+ items[i].id + "," + aid + ", \"" + type
								+ "\");'";
						content += "<tr class='" + rowClass + "'>";
						content += "<td class='author'>" + items[i].author
								+ "</td>";
						content += "<td class='title'>" + items[i].title
								+ "</td>";
						content += "<td class='abstract'>"
								+ items[i].description + "</td>";
						content += "</tr>";
					}
					content += "</table>";
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
					style : "height: 500px; width: 70%;",
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
				if ($defined(items) && items.length > 0) {
					var content = "<table class='items'>";
					content += "<tr><th>Author</th><th>Title</th><th>Abstract</th></tr>";
					for ( var i = 0; i < items.length; i++) {
						var rowClass = (i % 2) ? "oddRow" : "evenRow";
						rowClass += " clickable' "
								+ "onClick='ngembryo.resource.showDetails("
								+ items[i].id + ", true);'";
						content += "<tr class='" + rowClass + "'>";
						content += "<td class='author'>" + items[i].author
								+ "</td>";
						content += "<td class='title'>" + items[i].title
								+ "</td>";
						content += "<td class='abstract'>"
								+ items[i].description + "</td>";
						content += "</tr>";
					}
					content += "</table>";
				} else {
					content = "No resources are currently registered with the system."
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
					style : "height: 500px; width: 70%;",
					content : this.displayAll()
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
				if ($defined(items) && items.length > 0) {
					content = "<table class='details'>";
					content += "<tr><td class='label'>Author:</td><td class='value author'>"
							+ items[0].author + "</td></tr>";
					content += "<tr><td class='label'>Title:</td><td class='value title'>"
							+ items[0].title + "</td></tr>";
					content += "<tr><td class='label'>Abstract:</td><td class='value abstract'>"
							+ items[0].description + "</td></tr>";
					content += "</table><br>";

					if (flag) {
						content += "<img class='addItem' alt='Add Item'"
								+ " onClick='ngembryo.resource.addItem("
								+ items[0].id + ");'><br>";
					}

					var ritems = items[0].resourceItems;
					if ($defined(ritems)) {
						content += "<table class='items'>"
								+ "<tr><th>Title</th><th>Abstract</th><th>mime</th><th>Link</th></tr>";
						for ( var i = 0; i < ritems.length; i++) {
							var rowClass = (i % 2) ? "oddRow" : "evenRow";
							content += "<tr class='" + rowClass
									+ "'><td class='title'>" + ritems[i].title
									+ "</td><td class='abstract'>"
									+ ritems[i].description
									+ "</td><td class='mime'>" + ritems[i].mime
									+ "</td><td class='link'><a href='"
									+ ritems[i].link
									+ " 'target='_blank'>open</a></td></tr>";
						}
						content += "</table>";
					}
				} else {
					content = "Resource details are currently unavailable."
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
					style : "height: 300px; width: 60%;",
					content : this.formatDetails(id, flag),
					onHide : function() {
						if (flag) {
							dojo.byId("resource-browser-dialog").focus();
						} else {
							dojo.byId("display-linked-dialog").focus();
						}
					},
					onFocus : function() {
					}
				});
				dojo.body().appendChild(rdd.domNode);
				rdd.startup();
				rdd.show();
			},

			/**
			 * Returns all of the resources that are currentlylinked to the
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
				var buttons = "<button type='button'"
						+ " onClick='ngembryo.resource.linkToAnnotation("
						+ aid
						+ ", \""
						+ type
						+ "\");"
						+ "'>Add resource</button> "
						+ "<button type='button'"
						+ " onClick='dijit.byId(\"display-linked-dialog\").hide();"
						+ "'>Cancel</button>";
				var content = "";
				if ($defined(items) && items.length > 0) {
					var content = buttons + "<br><table class='items'>";
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
					content += "</table><br>" + buttons;
				} else {
					content += "None of the resources are currently not linked to this annotation.<br>"
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
					content : this.formatLinked(aid, type, label, description),
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
