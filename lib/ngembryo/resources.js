/**
 * Encapsulates a resource.
 */
var Resource = new Class({
    initialize: function() {
    },
    /**
     * This retrieves data according to the supplied url. This is a low-level
     * function.
     */
    __get: function(url) {
        var data = null;
        dojo.xhrGet({
            url: url,
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs) {
                if ($defined(response)) {
                    if (response.success) {
                        data = response.r;
                        if (!$defined(data)) {
                            ngembryo.content.feedback.show("info",
                                response.message);
                        }
                    } else {
                        ngembryo.content.feedback
                            .show("warn", response.message);
                    }
                } else {
                    ngembryo.content.feedback.show("error",
                        "Server did not respond");
                }
            }.bind(this),
            error: function(response, ioArgs) {
                ngembryo.content.feedback.show("error", "HTTP status code ("
                    + ioArgs.xhr.status + ") : Failure to "
                    + "process server response");
            }
        });
        return data;
    },
    /**
     * Returns all of the resources currently registered with the system. This
     * does not depend on the annotations. In order for a resource to be able
     * for linking to an annotation, it must be first registered with the
     * system.
     */
    getAll: function() {
        return this.__get("getResources.php");
    },
    /**
     * Destroys the resources object.
     */
    destroy: function() {
        var ids = [ "create-resource", "resource-browser", "add-resource-item",
            "add-ralink", "resource-detail", "display-linked-resources" ];
        for (var i = 0; i < ids.length; i++) {
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
    __getForm: function(url) {
        var form = null;
        dojo.xhrGet({
            url: url,
            handleAs: "text",
            sync: true,
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs) {
                form = response;
            },
            error: function(response, ioArgs) {
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
    create: function(flag) {
        var crd = dijit.byId("create-resource-dialog");
        if ($defined(crd)) {
            dojo.body().removeChild(crd.domNode);
            crd.destroyRecursive(false);
        }
        crd = new dijit.Dialog({
            id: "create-resource-dialog",
            title: "Create new resource",
            style: "width: 590px;",
            content: this.__getForm("createResourceForm.php"),
            onHide: function() {
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
            /*
             * prevent the form from actually submitting.
             */
            event.preventDefault();
            /* submit the form in the background */
            dojo.xhrPost({
                url: "createResource.php",
                form: "cres",
                handleAs: "json",
                load: function(response, ioArgs) {
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
                error: function(response, ioArgs) {
                    ngembryo.content.feedback.show("error",
                        "HTTP status code (" + ioArgs.xhr.status
                        + ") : Failure to"
                        + " process server response");
                    return response;
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
     * Modify the details of an existing resource.
     */
    edit: function(rid, e) {
        /* First disable event bubbling. */
        if (!e)
            var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }

        var erd = dijit.byId("edit-resource-dialog");
        if ($defined(erd)) {
            dojo.body().removeChild(erd.domNode);
            erd.destroyRecursive(false);
        }
        erd = new dijit.Dialog({
            id: "edit-resource-dialog",
            title: "Edit resource details",
            style: "width: 590px;",
            content: this.__getForm("updateResourceForm.php?rid=" + rid),
            onHide: function() {
                dojo.byId("resource-browser-dialog").focus();
            }
        });
        dojo.body().appendChild(erd.domNode);
        var theForm = dojo.byId("eres");
        var handle = dojo.connect(theForm, "onsubmit", function(event) {
            /*
             * prevent the form from actually submitting.
             */
            event.preventDefault();
            /* submit the form in the background */
            dojo.xhrPost({
                url: "updateResource.php",
                form: "eres",
                handleAs: "json",
                load: function(response, ioArgs) {
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
                error: function(response, ioArgs) {
                    ngembryo.content.feedback.show("error",
                        "HTTP status code (" + ioArgs.xhr.status
                        + ") : Failure to process server response");
                    return response;
                }
            });
            dojo.disconnect(handle);
            erd.hide();
            ngembryo.engine.refresh();
        });
        erd.startup();
        erd.show();
    },
    /**
     * Add resource item.
     */
    addItem: function(rid) {
        var ari = dijit.byId("add-resource-item-dialog");
        if ($defined(ari)) {
            dojo.body().removeChild(ari.domNode);
            ari.destroyRecursive(false);
        }
        ari = new dijit.Dialog({
            id: "add-resource-item-dialog",
            title: "Create new resource",
            style: "width: 590px;",
            content: this.__getForm("createResouceItemForm.php?rid=" + rid),
            onHide: function() {
                dojo.byId("resource-detail-dialog").focus();
            }
        });
        dojo.body().appendChild(ari.domNode);
        var theForm = dojo.byId("crit");
        var handle = dojo.connect(theForm, "onsubmit", function(event) {
            /* prevent the form from actually submitting. */
            event.preventDefault();
            /* submit the form in the background */
            dojo.xhrPost({
                url: "createResourceItem.php",
                form: "crit",
                handleAs: "json",
                handle: function(data, args) {
                    if (typeof data === "error") {
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
     * @param n
     *            The row DOM element which generated this event.
     */
    addToAnnotation: function(rid, aid, type, n) {
        /*
         * Remove item as soon as it is added before starting server request. If
         * the communication with the server is delayed, then it gives the
         * impression that the item hasn't been added to the annotation.
         */
        var t = dojo.byId("available-resources-table");
        if ($defined(t) && $defined(n)) {
            t.deleteRow(n.rowIndex);
        }
        dojo.xhrGet({
            url: "addResourceToAnnotation.php?rid=" +
                rid + "&aid=" + aid + "&type=" + type,
            handleAs: "json",
            handle: function(data, args) {
                if (typeof data === "error") {
                    console.warn("Error", args);
                }
                ngembryo.engine.refresh();
            }
        });
    },
    /**
     * Returns all of the resources that are currently available to the
     * specified annotation for linking. This list excludes all of the resources
     * that are already linked to the annotation.
     * 
     * @param aid
     *            Unique identifier of the annotation.
     * @param type
     *            Annotation type.
     * @return List of resources, or null if error or empty.
     */
    getAvailable: function(aid, type) {
        var url = "getAnnotationResources.php?aid=" +
            aid + "&type=" + type + "&exclude=1";
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
    formatAvailable: function(aid, type) {
        var unlinked = this.getAvailable(aid, type);
        var items = unlinked.r;
        var content = "";
        if ($defined(items) && items.length > 0) {
            content = "Click on the corresponding row to "
                + "retrieve resource details.<br><br>"
                + "<div class='resource-browser'>"
                + "<table class='items' id='"
                + "available-resources-table'>"
                + "<tr><th>Author</th><th>Title"
                + "</th><th>Abstract</th></tr>";
            for (var i = 0; i < items.length; i++) {
                var rowClass = (i % 2) ? "oddRow" : "evenRow";
                rowClass += " clickable' " + "onClick='ngembryo.resource."
                    + "addToAnnotation(" + items[i].id + "," + aid + ", \""
                    + type + "\", this);";
                content += "<tr class='" + rowClass + "'>";
                content += "<td class='author'>" + items[i].a + "</td>";
                content += "<td class='title'>" + items[i].t + "</td>";
                content += "<td class='abstract'>" + items[i].d + "</td>";
                content += "</tr>";
            }
            content += "</table></div>";
        } else {
            content = "No unlinked resources are currently "
                + "available for this annotation.";
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
    linkToAnnotation: function(aid, type) {
        var arad = dijit.byId("add-ralink-dialog");
        if ($defined(arad)) {
            dojo.body().removeChild(arad.domNode);
            arad.destroyRecursive(false);
        }
        arad = new dijit.Dialog({
            id: "add-ralink-dialog",
            title: "Add resource to annotation",
            style: "width: 70%;",
            content: this.formatAvailable(aid, type),
            onHide: function() {
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
    deleteResource: function(e, rid, n) {
        confirmDialog("Delete resource", "Deleting a resource will"
            + " also delete all of " + "the associated resource items. "
            + "Do you wish to continue?", function(flag) {
            if (flag) {
                var t = dojo.byId("available-resources-table");
                if ($defined(t) && $defined(n)) {
                    var i = n.parentNode.parentNode.rowIndex;
                    t.deleteRow(i);
                }
                ngembryo.resource.__get("deleteResource.php?rid=" + rid);
                ngembryo.engine.refresh();
                dojo.byId("resource-browser-dialog").focus();
            }
        }, function() {
            dojo.byId("resource-browser-dialog").focus();
        }, e);
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
    displayAll: function() {
        var items = this.getAll();
        var content = "";
        var buttons = "<button type='button'"
            + " onClick='ngembryo.resource.create(true);'>"
            + "Add resource</button> " + "<button type='button'"
            + " onClick='dijit.byId(\"resource"
            + "-browser-dialog\").hide();" + "'>Cancel</button>";

        if ($defined(items) && items.length > 0) {
            var content = "Click on the corresponding row to "
                + "retrieve resource details.<br><br>"
                + "<div class='resource-browser'>"
                + "<table class='items' id='"
                + "available-resources-table'>"
                + "<tr><th>Author</th><th>Title</th>"
                + "<th>Abstract</th><th>Action</th></tr>";
            for (var i = 0; i < items.length; i++) {
                var rowClass = (i % 2) ? "oddRow" : "evenRow";
                rowClass += " clickable' " + "onClick='window.open(\""
                    + items[i].l + "\");'";
                var ed = "";
                if (items[i].m) {
                    ed = "<button type='button'"
                        + " onClick='ngembryo.resource." + "edit("
                        + items[i].id + ", event);'>edit</button>"
                        + " <button type='button'"
                        + " onClick='ngembryo.resource."
                        + "deleteResource(event, " + items[i].id
                        + ", this);'>delete</button>";
                } else {
                    ed = "Owned by administrator";
                }
                content += "<tr class='" + rowClass + "'>"
                    + "<td class='author'>" + items[i].a + "</td>"
                    + "<td class='title'>" + items[i].t + "</td>"
                    + "<td class='abstract'>" + items[i].d + "</td>"
                    + "<td>" + ed + "</td></tr>";
            }
            content += "</table></div><br>" + buttons;
        } else {
            content = "No resources are currently registered"
                + " with the system.<br><br>" + buttons;
        }
        return content;
    },
    /**
     * Lists all of the available resources.
     */
    list: function() {
        var rbd = dijit.byId("resource-browser-dialog");
        if ($defined(rbd)) {
            dojo.body().removeChild(rbd.domNode);
            rbd.destroyRecursive(false);
        }
        var rbd = new dijit.Dialog({
            id: "resource-browser-dialog",
            title: "Registered resources",
            style: "width: 70%;",
            onFocus: function() {
                rbd.attr({
                    content: this.displayAll()
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
    getDetails: function(id) {
        return this.__get("getResources.php?rid=" + id);
    },
    /**
     * Delete resource item.
     */
    deleteItem: function(rid, iid) {
        return this.__get("deleteResourceItem.php?rid=" + rid + "&iid=" + iid);
    },
    /**
     * Shows resource detail.
     * 
     * @param id
     *            Unique identifier of the resource.
     * @param flag
     *            True if new items can be added to the resource.
     */
    showDetails: function(id, flag) {
        var rdd = dijit.byId("resource-detail-dialog");
        if ($defined(rdd)) {
            dojo.body().appendChild(rdd.domNode);
            rdd.destroyRecursive(false);
        }
        var rdd = new dijit.Dialog({
            id: "resource-detail-dialog",
            title: "Resource details",
            style: "width: 70%;",
            onHide: function() {
                var parent = null;
                if (flag) {
                    parent = dojo.byId("resource-browser-dialog");
                } else {
                    parent = dojo.byId("display-linked-dialog");
                }
                if ($defined(parent))
                    parent.focus();
            },
            onFocus: function() {
                rdd.attr({
                    content: this.formatDetails(id, flag)
                });
            }.bind(this)
        });
        dojo.body().appendChild(rdd.domNode);
        rdd.startup();
        rdd.show();
    },
    /**
     * Returns all of the resources that are currently linked to the specified
     * annotation.
     * 
     * @param aid
     *            Unique identifier of the annotation.
     * @param type
     *            Annotation type.
     * @return List of resources, or null if error or empty.
     */
    getLinked: function(aid, type) {
        var url = "getAnnotationResources.php?aid=" +
            aid + "&type=" + type + "&exclude=0";
        return this.__get(url);
    },
    /**
     * Delete annotation.
     */
    deleteAnnotation: function(e, aid, type) {
        confirmDialog("Delete annotation",
            "Are you sure you wish to delete this annotation?", function(
            flag) {
            if (flag) {
                ngembryo.resource.__get("deleteAnnotation.php?aid=" +
                    aid + "&type=" + type);
                ngembryo.engine.refresh();
                dijit.byId("display-linked-dialog").hide();
            }
        }, function() {
            dojo.byId("display-linked-dialog").focus();
        }, e);
        return false;
    },
    /**
     * Unlink resource from annotation.
     * 
     * @param {Object}
     *            e unlick button press event.
     * @param {Integer}
     *            aid Annotation ID.
     * @param {Integer}
     *            rid Resource ID to unlink.
     * @param {String}
     *            type Type of the annotation.
     * @param {DOM}
     *            n DOM node for the unlink button.
     */
    unlink: function(e, aid, rid, type, n) {
        confirmDialog("Remove resource", "This will only unlink the resource"
            + " from this annotation. "
            + "The resource will not be deleted. "
            + "Do you wish to continue?", function(flag) {
            if (flag) {
                var t = dojo.byId("linked-resources-table");
                if ($defined(t) && $defined(n)) {
                    t.deleteRow(n.parentNode.parentNode.rowIndex);
                }
                ngembryo.resource.__get(
                    "unlinkResourceFromAnnotation.php?rid=" + rid +
                    "&aid=" + aid + "&type=" + type);
                ngembryo.engine.refresh();
                dojo.byId("display-linked-dialog").focus();
            }
        }, function() {
            dojo.byId("display-linked-dialog").focus();
        }, e);
        return false;
    },
    /**
     * Edit annotation details.
     */
    editAnnotation: function(e, aid, type) {
        var ead = dijit.byId("edit-annotation-dialog");
        if ($defined(ead)) {
            dojo.body().removeChild(ead.domNode);
            ead.destroyRecursive(false);
        }
        ead = new dijit.Dialog({
            id: "edit-annotation-dialog",
            title: "Edit resource details",
            style: "width: 590px;",
            content: this.__getForm("updateAnnotationForm.php?aid=" +
                aid + "&type=" + type),
            onHide: function() {
                dojo.byId("display-linked-dialog").focus();
            }
        });
        dojo.body().appendChild(ead.domNode);
        var theForm = dojo.byId("eann");
        var handle = dojo.connect(theForm, "onsubmit", function(event) {
            /*
             * prevent the form from actually submitting.
             */
            event.preventDefault();
            /* submit the form in the background */
            dojo.xhrPost({
                url: "updateAnnotation.php",
                form: "eann",
                sync: true,
                handleAs: "json",
                load: function(response, ioArgs) {
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
                error: function(response, ioArgs) {
                    ngembryo.content.feedback.show("error",
                        "HTTP status code (" + ioArgs.xhr.status
                        + ") : Failure to process server response");
                    return response;
                }
            });
            dojo.disconnect(handle);
            ead.hide();
            ngembryo.engine.refresh();
        });
        ead.startup();
        ead.show();
    },
    /**
     * Formats the linked resources for display.
     * 
     * @param aid
     *            Unique identifier of the annotation.
     * @param type
     *            Annotation type.
     */
    formatLinked: function(aid, type) {
        var linked = this.getLinked(aid, type);
        var items = linked.r;
        var buttons = "";

        if (linked.m) {
            buttons = "<table width=100% border=0><tr>"
                + "<td><button type='button'" + " onClick='ngembryo.resource."
                + "editAnnotation(event, "
                + aid
                + ", \""
                + type
                + "\");'>Edit annotation"
                + "</button> <button type='button'"
                + " onClick='ngembryo.resource."
                + "linkToAnnotation("
                + aid
                + ", \""
                + type
                + "\");"
                + "'>Add resource</button> "
                + "<button type='button'"
                + " onClick='dijit.byId(\"display-"
                + "linked-dialog\").hide();"
                + "'>Cancel</button></td>"
                + "<td align=right><button type='button'"
                + " onClick='ngembryo.resource."
                + "deleteAnnotation(event, "
                + aid
                + ", \""
                + type
                + "\");'>Delete annotation"
                + "</button></td></tr></table>";
        }
        var content = "<b>Label:</b> " + "<span id='display-linked-label'>"
            + linked.l + "</span><br><b>Description:</b> <span "
            + "id='display-linked-description'>" + linked.d
            + "</span>";
        if ($defined(items) && items.length > 0) {
            content += "<br><br>The following resources"
                + " are currently linked " + "to this annotation.<br>"
                + "<div class='resource-browser'>"
                + "<table id='linked-resources-table' class='items'>"
                + "<tr><th>Author</th><th>Title"
                + "</th><th>Abstract</th>";
            if (linked.m) {
                content += "<th>Action</th></tr>";
            }
            for (var i = 0; i < items.length; i++) {
                var rowClass = (i % 2) ? "oddRow" : "evenRow";
                rowClass += " clickable' " + "onClick='window.open(\""
                    + items[i].l + "\");'";
                content += "<tr class='" + rowClass + "'>"
                    + "<td class='author'>" + items[i].a + "</td>"
                    + "<td class='title'>" + items[i].t + "</td>"
                    + "<td class='abstract'>" + items[i].d + "</td>";

                if (linked.m) {
                    content +=
                        "<td align=right>" + "<button type='button'"
                        + " onClick='ngembryo.resource." + "unlink(event, "
                        + aid + "," + items[i].id + ",\"" + type
                        + "\", this);'>Remove" + "</button></td>";
                }
                content += "</tr>";
            }
            content += "</table></div><br>" + buttons;
        } else {
            content += "<br><br>This annotation is"
                + " not linked to any of the "
                + "available resources.<br><br>" + buttons;
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
    displayLinked: function(aid, type, label, description) {
        srd = new dijit.Dialog({
            id: "display-linked-dialog",
            title: "Show resources linked to annotation",
            style: "width: 70%;",
            onHide: function() {
                dojo.body().removeChild(this.domNode);
                this.destroyRecursive(false);
            },
            onFocus: function() {
                srd.attr({
                    content: this.formatLinked(aid, type)
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
    __old_showResources: function(id, label, description, type) {
        this.setResourceGrid(id, label, description, type);
        dialog.show();
    },
    /**
     * Retrieve resource information from the repository.
     */
    __old_setResourceGrid: function(id, label, description, type) {
        var store = new dojox.data.CsvStore({
            url: "getAnnotationResources.php?aid=" + id + "&type=" + type
                + "&exclude=0&format=csv"
        });
        var layout = [ {
                field: 'id',
                name: 'id',
                width: '20px'
            }, {
                field: 'author',
                name: 'author',
                width: '200px'
            }, {
                field: 'title',
                name: 'title',
                width: '200px'
            }, {
                field: 'abstract',
                name: 'abstract',
                width: 'auto'
            }, {
                field: 'url',
                name: 'url',
                width: '200px'
            } ];
        var grid = new dojox.grid.DataGrid({
            query: {
                id: '*'
            },
            store: store,
            clientSort: true,
            rowSelector: '20px',
            structure: layout
        });

        var c = dojo.create("div", {
            id: "resourceContent"
        });
        var d = dojo.create("div", {
            id: "resourceDescription",
            innerHTML: "<b>Description: </b>" + description
        });
        c.appendChild(d);
        var actions = dojo.create("div", {
            id: "resourceActions",
            innerHTML: "<img src='' alt='Add resource'"
                + " onClick='ngembryo.resource." + "linkToAnnotation(" + id
                + ", \"" + type + "\");'>"
        });
        c.appendChild(actions);
        var t = dojo.create("div", {
            id: "resourceGrid"
        });
        t.appendChild(grid.domNode);
        c.appendChild(t);
        grid.startup();

        dialog.attr({
            title: label,
            style: "height: 500px; width: 50%;",
            content: c
        });
    }
});
