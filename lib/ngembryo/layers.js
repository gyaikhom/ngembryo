/**
 * Encapsulates layers.
 * 
 * Layers are assigned to an orientation for a given model. This class
 * encapsulates the methods for retrieving layers which belong to a model at the
 * given orientation.
 */
var Layer = new Class({
    initialize: function() {
        ngembryo.lid = -1;
        this.refresh();
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
            error: function(response, ioArgs) {
                ngembryo.content.feedback.show("error", "HTTP status code ("
                    + ioArgs.xhr.status
                    + ") : Failure to process server response");
            }
        });
        return data;
    },
    /**
     * Refreshes the list of layers that are available for the orientations
     * parameters as currently set on the controls panel.
     */
    refresh: function() {
        if (ngembryo.oid !== -1)
            /* Use in reset. */
            ngembryo.orientation.old_oid = ngembryo.oid;
        ngembryo.oid = -1;
        var model = ngembryo.mid;
        var dst = dojo.byId("dstValue").value;
        var yaw = dojo.byId("yawValue").value;
        var pit = dojo.byId("pitchValue").value;
        var rol = dojo.byId("rollValue").value;
        dojo.xhrGet({
            url: "getLayers.php?model=" + model + "&distance=" + dst +
                "&yaw=" + yaw + "&roll=" + rol + "&pitch=" + pit,
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs) {
                if ($defined(response)) {
                    if (response.success) {
                        /* Check current visibility settings. */
                        if ($defined(this.items) && $defined(response.l)) {
                            for (var i = 0; i < this.items.length; i++) {
                                for (var j = 0; j < response.l.length; j++) {
                                    if (this.items[i].i === response.l[j].i) {
                                        response.l[j].v = this.items[i].v;
                                        break;
                                    }
                                }
                            }
                        }
                        this.items = response.l;
                    } else {
                        this.items = null;
                        this.select(-1);
                    }
                }
            }.bind(this),
            error: function(response, ioArgs) {
                ngembryo.content.feedback.show("error", "HTTP status code ("
                    + ioArgs.xhr.status
                    + ") : Failure to process server response");
                return response;
            }
        });
    },
    /**
     * Create layer by contacting server.
     */
    __CL: function() {
    },
    /**
     * Creates a new layer at the current orientation.
     * 
     * @param flag
     *            True if this is invoked from layer browser dialog.
     */
    create: function(flag) {
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
        var url = "createLayerForm.php?model=" + model + "&distance=" +
            distance + "&yaw=" + yaw + "&roll=" + roll + "&pitch=" + pitch;
        cld = new dijit.Dialog({
            id: "create-layer-dialog",
            title: "Create new layer",
            style: "width: 590px;",
            content: this.__getForm(url),
            onHide: function() {
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
            /*
             * prevent the form from actually submitting.
             */
            event.preventDefault();
            /* submit the form in the background */
            dojo.xhrPost({
                url: "createLayer.php",
                form: "clay",
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
            cld.hide();
            ngembryo.engine.refresh();
        });
        cld.startup();
        cld.show();
    },
    /**
     * Edit layer details.
     */
    edit: function(lid, e) {
        /* First disable event bubbling. */
        if (!e)
            var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }

        var eld = dijit.byId("edit-layer-dialog");
        if ($defined(eld)) {
            dojo.body().removeChild(eld.domNode);
            eld.destroyRecursive(false);
        }
        var url = "updateLayerForm.php?lid=" + lid;
        eld = new dijit.Dialog({
            id: "edit-layer-dialog",
            title: "Create new layer",
            style: "width: 590px;",
            content: this.__getForm(url),
            onHide: function() {
                dojo.byId("layer-browser-dialog").focus();
            }
        });
        dojo.body().appendChild(eld.domNode);
        var theForm = dojo.byId("elay");
        var handle = dojo.connect(theForm, "onsubmit", function(event) {
            /*
             * prevent the form from actually submitting.
             */
            event.preventDefault();
            /* submit the form in the background */
            dojo.xhrPost({
                url: "updateLayer.php",
                form: "elay",
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
            eld.hide();
            ngembryo.engine.refresh();
        });
        eld.startup();
        eld.show();
    },
    /**
     * Formats the available layers for display.
     */
    formatLayers: function() {
        ngembryo.layer.refresh();
        var content = "";
        var isVisible;
        var items = ngembryo.layer.items;
        var buttons = "<button type='button'"
            + " onClick='ngembryo.layer.create(true);'>"
            + "Add layer</button> " + "<button type='button'"
            + " onClick='dijit.byId(\"layer-browser-dialog\").hide();"
            + "'>Cancel</button>";

        if ($defined(items)) {
            var content = "Click on the layer to select. Currently "
                + "selected layer is highlighted.<br><br>"
                + "Set visibility of all layers:"
                + " <button type='button'" + " onClick='ngembryo.layer."
                + "setAllLayersVisibility(true);'>"
                + "Show all</button><button type='button'"
                + " onClick='ngembryo.layer."
                + "setAllLayersVisibility(false);'>"
                + "Hide all</button><br><div " + "class='layer-browser'>"
                + "<table class='items' " + "id='available-layers-table'>"
                + "<tr><th>Title</th><th>Description"
                + "</th><th>Visibility" + "</th><th>Action</th></tr>";
            for (var i = 0; i < items.length; i++) {
                var rowClass = (i % 2) ? "oddRow" : "evenRow";
                var selected = (items[i].i === ngembryo.lid) ? true : false;
                var oc = "";
                var ed = "";
                if (items[i].m) {
                    ed = "<button type='button'"
                        + " onClick='ngembryo.layer." + "edit(" + items[i].i
                        + ", event);'>edit</button> <button type='button'"
                        + " onClick='ngembryo.layer." + "deleteLayer(event, "
                        + items[i].i + ", " + (i + 1)
                        + ");'>delete</button>";
                    oc = "ngembryo.layer.selectCloseDialog(" + items[i].i
                        + ");";
                } else {
                    ed = "Owned by administrator";
                    oc = "alert(\"Cannot select layer. Layer currently "
                        + "owned by administrator.\");";
                }

                rowClass += selected ? " selected'" : " clickable' onClick='"
                    + oc + "'";
                isVisible = (items[i].v) ? "checked" : "";
                content += "<tr id='layer-identifier-" + items[i].i
                    + "' class='" + rowClass + ">" + "<td class='title'>"
                    + items[i].t + "</td>" + "<td class='abstract'>"
                    + items[i].d + "</td><td><input type='checkbox' "
                    + "id='layer-visibility-checkbox-" + i + "' "
                    + isVisible + " onClick='ngembryo.layer."
                    + "toggleLayerVisibility(" + "event, " + i
                    + ", this);'></td>" + "</td><td>" + ed + "</td></tr>";
            }
            content += "</table></div><br>" + buttons;
        } else {
            content = "No layers are currently registered for this "
                + "orientation. Please create a new layer, or "
                + "select a different orientation.<br><br>" + buttons;
        }
        return content;
    },
    /**
     * Destroys the layers object.
     */
    destroy: function() {
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
        this.select(-1); /* Don't select any layer. */
    },
    /**
     * Format form for layer creation.
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
     * Hide/Display layer.
     */
    toggleLayerVisibility: function(e, index, elem) {
        if (!e)
            var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        this.items[index].v = !this.items[index].v;
        elem.checked = this.items[index].v;
        if (this.items[index].v) {
            var t = dojo.byId("layer-identifier-" + ngembryo.lid);
            if ($defined(t))
                dojo.removeClass(t, "selected");
            this.select(this.items[index].i); /* Select this layer. */
            t = dojo.byId("layer-identifier-" + ngembryo.lid);
            if ($defined(t))
                dojo.addClass(t, "selected");
        } else {
            if (this.items[index].i === ngembryo.lid) {
                var t = dojo.byId("layer-identifier-" + ngembryo.lid);
                if ($defined(t))
                    dojo.removeClass(t, "selected");
                this.select(-1); /* Don't select any layer. */
            }
        }
        ngembryo.engine.refresh();
    },
    /**
     * Show/Hide all layers.
     */
    setAllLayersVisibility: function(flag) {
        if ($defined(this.items)) {
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].v = flag;
                var elem = dojo.byId("layer-visibility-checkbox-" + i);
                elem.checked = flag;
                var t = dojo.byId("layer-identifier-" + this.items[i].i);
                if ($defined(t))
                    dojo.removeClass(t, "selected");
            }
            if (flag) {
                this.select(null); /* Select first layer. */
                var t = dojo.byId("layer-identifier-" + ngembryo.lid);
                if ($defined(t))
                    dojo.addClass(t, "selected");
            } else {
                this.select(-1); /* Don't select any layer. */
            }
            ngembryo.engine.refresh();
        }
    },
    /**
     * Delete layer.
     */
    deleteLayer: function(e, lid, i) {
        confirmDialog("Delete layer", "Deleting a layer will also delete all "
            + "of the associated annotations. "
            + "Do you wish to continue?", function(flag) {
            if (flag) {
                dojo.byId("available-layers-table").deleteRow(i);
                ngembryo.layer.__get("deleteLayer.php?lid=" + lid);
                if (lid === ngembryo.lid) {
                    /* Don't select any layer. */
                    this.select(-1);
                }
                ngembryo.layer.refresh();
                ngembryo.engine.refresh();
            }
        }, function() {
            dojo.byId("layer-browser-dialog").focus();
        }, e);
        return false;
    },
    /**
     * Displays all of the layers that are currently available for this
     * orientation. The orientation is determined by the values currently set on
     * the controls panel. Note that the orientation parameters are not affected
     * by previously selected orientations.
     */
    display: function() {
        var lbd = dijit.byId("layer-browser-dialog");
        if ($defined(lbd)) {
            dojo.body().removeChild(lbd.domNode);
            lbd.destroyRecursive(false);
        }
        lbd = new dijit.Dialog({
            id: "layer-browser-dialog",
            title: "Select layer",
            style: "width: 70%;",
            onHide: function() {
                dojo.body().removeChild(lbd.domNode);
                lbd.destroyRecursive(false);
            },
            onFocus: function() {
                lbd.attr({
                    content: this.formatLayers()
                });
            }.bind(this)
        });
        dojo.body().appendChild(lbd.domNode);
        lbd.startup();
        lbd.show();
    },
    selectCloseDialog: function(id) {
        this.select(id);
        dijit.byId("layer-browser-dialog").hide();
    },
    /**
     * Selects the supplied layer.
     * 
     * @param id
     *            Unique identifier of the layer to select.
     */
    select: function(id) {
        var title = "";
        /* Select the first item in the layer list. */
        if (id === null) {
            if ($defined(this.items) && this.items.length > 0) {
                ngembryo.lid = this.items[0].i;
                title = this.items[0].t;
            }
        } else {
            /* Do not select a layer. */
            if (id === -1) {
                ngembryo.lid = -1;
                title = "No layer selected...";
            } else { /* Check supplied ID, and select layer. */
                if ($defined(this.items)) {
                    var index = -1;
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].i === id) {
                            index = i;
                            break;
                        }
                    }
                    /* If the identifier was found, continue. */
                    if (index !== -1) {
                        ngembryo.lid = id;
                        title = this.items[index].t;
                        this.items[index].v = true;
                        ngembryo.content.feedback.show("info", "Layer '"
                            + title + "' has been selected.");
                    } else {
                        ngembryo.content.feedback.show("warn",
                            "Did not find layer with ID: " + ngembryo.lid);
                        return;
                    }
                }
            }
        }
        dojo.byId("control-layer-value").innerHTML = title;
        ngembryo.refresh();
    },
    /**
     * Check if the layer id is valid. If not valid, show a dialog box asking
     * user to select layer.
     */
    checkLayer: function() {
        if (!$defined(ngembryo.lid) || ngembryo.lid === -1) {
            var ild = new dijit.Dialog({
                id: "invalid-layer-dialog",
                title: "Invalid layer",
                content: "<div align='left'>" + "No layer has been selected. "
                    + "Please select a layer using the layer "
                    + "menu on the toolbar.<br><br>"
                    + "<button type='button'" + " onClick='dijit.byId"
                    + "(\"invalid-layer-dialog\").hide();"
                    + "'>Ok</button></div>",
                onHide: function() {
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
