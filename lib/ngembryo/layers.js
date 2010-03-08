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
 * Layers are assigned to an orientation for a given model. This
 * class encapsulates the methods for retrieving layers which
 * belong to a model at the given orientation.
 */
var Layer = new Class({
    initialize: function(){
        this.refresh();
    },
    
    refresh: function(){
        this.items = null;
        var model = ngembryo.mid;
        var dst = dojo.byId("dstValue").value;
        var yaw = dojo.byId("yawValue").value;
        var pit = dojo.byId("pitchValue").value;
        var rol = dojo.byId("rollValue").value;
        dojo.xhrGet({
            url: "getLayers.php?model=" + model + "&distance=" + dst + "&yaw=" + yaw + "&roll=" + rol + "&pitch=" + pit + "&format=json",
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds.*/
            load: function(response, ioArgs){
                if ($defined(response)) {
                    if (response.success) {
                        this.items = response.layers;
                        if ($defined(this.items) && this.items.length > 0) {
                            if (ngembryo.lid == -1) {
                                ngembryo.lid = this.items[0].id;
                                this.select(ngembryo.lid);
                            }
                        }
                        else 
                            ngembryo.lid = -1;
                    }
                }
            }
.bind(this)            ,
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
                return response;
            }
        });
    },
    
    destroy: function(){
        var lbd = dijit.byId("layer-browser-dialog");
        if ($defined(lbd)) 
            lbd.destroyRecursive(false);
    },
    
    create: function(){
        var cld = new dijit.Dialog({
            id: "create-layer-dialog",
            title: "Create new layer",
            onHide: function(){
                this.destroyRecursive(false);
            }
        });
        dojo.body().appendChild(cld.domNode);
        cld.startup();
        
        var model = ngembryo.mid;
        var distance = dojo.byId("dstValue").value;
        var yaw = dojo.byId("yawValue").value;
        var pitch = dojo.byId("pitchValue").value;
        var roll = dojo.byId("rollValue").value;
        dojo.xhrGet({
            url: "clay.php?model=" + model + "&distance=" + distance + "&yaw=" + yaw + "&roll=" + roll + "&pitch=" + pitch,
            handleAs: "text",
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs){
                cld.attr({
                    style: "height: 375px; width: 590px;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                var theForm = dojo.byId("clay");
                dojo.connect(theForm, "onsubmit", function(event){
                    /* prevent the form from actually submitting. */
                    event.preventDefault();
                    /* submit the form in the background */
                    dojo.xhrPost({
                        url: "createLayer.php",
                        form: "clay",
                        handleAs: "json",
                        handle: function(data, args){
                            if (typeof data == "error") {
                                console.warn("Error", args);
                            }
                            else {
                                console.log(data);
                                this.refresh();
                            }
                        }
                    });
                    cld.hide();
                    ngembryo.engine.refresh();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
        cld.show();
    },
    
    display: function(){
        var lbd = dijit.byId("layer-browser-dialog");
        if ($defined(lbd)) 
            lbd.destroyRecursive(false);
        lbd = new dijit.Dialog({
            id: "layer-browser-dialog",
            title: "Select layer",
            onFocus: function(){
                ngembryo.layer.refresh();
                var items = ngembryo.layer.items;
                if ($defined(items)) {
                    var list = "<table class='items'><tr><th>Title</th><th>Abstract</th></tr>";
                    for (var i = 0; i < items.length; i++) {
                        var rowClass = (i % 2) ? "oddRow" : "evenRow";
                        var selected = (items[i].id == ngembryo.lid) ? true : false;
                        rowClass += selected ? " selected'" : " clickable' onClick='ngembryo.layer.select(" + items[i].id + ");'";
                        list += "<tr class='" + rowClass + ">";
                        list += "<td class='title'>" + items[i].title + "</td>";
                        list += "<td class='abstract'>" + items[i].description + "</td>";
                        list += "</tr>";
                    }
                    list += "</table>";
                    lbd.attr({
                        style: "height: 500px; width: 550px;",
                        content: "<div align='left' style='height: 530px; overflow: auto;'>" + list + "</div>"
                    });
                }
                else {
                    lbd.attr({
                        style: "height: 500px; width: 60%;",
                        content: "<div align='left' style='height: 450px; overflow: auto;'>No layers are currently defined at this orientation. Please create a new layer.</div>"
                    });
                }
            }
        });
        dojo.body().appendChild(lbd.domNode);
        lbd.startup();
        lbd.show();
    },
    select: function(id){
        if ($defined(this.items)) {
            var index = -1;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == id) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                ngembryo.lid = id;
                dijit.byId("layer-browser-dialog").hide();
                ngembryo.refresh();
            }
        }
    }
});
