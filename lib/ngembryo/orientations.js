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
var Orientation = new Class({
    initialize: function(){
        this.refresh();
    },
    
    refresh: function(){
        this.items = null;
        dojo.xhrGet({
            url: "getOrientations.php?model=" + ngembryo.mid + "&format=json",
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds.*/
            load: function(response, ioArgs){
                if ($defined(response)) {
                    if (response.success) {
                        this.items = response.orientations;
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
        var obd = dijit.byId("orientation-browser-dialog");
        if ($defined(obd)) 
            obd.destroyRecursive(false);
        ngembryo.oid = -1;
    },
    
    create: function(){
        var cod = new dijit.Dialog({
            id: "create-orientation-dialog",
            title: "Create new orientation",
            onHide: function(){
                this.destroyRecursive(false);
            }
        });
        dojo.body().appendChild(cod.domNode);
        cod.startup();
        
        var model = ngembryo.mid;
        var distance = dojo.byId("dstValue").value;
        var yaw = dojo.byId("yawValue").value;
        var pitch = dojo.byId("pitchValue").value;
        var roll = dojo.byId("rollValue").value;
        dojo.xhrGet({
            url: "cori.php?model=" + model + "&distance=" + distance + "&yaw=" + yaw + "&roll=" + roll + "&pitch=" + pitch,
            handleAs: "text",
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs){
                cod.attr({
                    title: "Create new orientation",
                    style: "height: 375px; width: 590px;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                var theForm = dojo.byId("cori");
                dojo.connect(theForm, "onsubmit", function(event){
                    /* prevent the form from actually submitting. */
                    event.preventDefault();
                    /* submit the form in the background */
                    dojo.xhrPost({
                        url: "createOrientation.php",
                        form: "cori",
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
                    cod.hide();
                    ngembryo.engine.refresh();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
        cod.show();
    },
    
    display: function(){
        var obd = dijit.byId("orientation-browser-dialog");
        if ($defined(obd)) 
            obd.destroyRecursive(false);
        obd = new dijit.Dialog({
            id: "orientation-browser-dialog",
            title: "Select orientation",
            onFocus: function(){
                ngembryo.orientation.refresh();
                var items = ngembryo.orientation.items;
                if ($defined(items) && items.length > 0) {
                    /* This determines the size of the images displayed inside the orientation browser. */
                    var scale = 0.15;
                    var navsrc = woolz.locator.server + '?' + woolz.model.fif +
                    "&mod=" +
                    woolz.model.mode +
                    "&fxp=" +
                    woolz.model.fxp.x +
                    ',' +
                    woolz.model.fxp.y +
                    ',' +
                    woolz.model.fxp.z +
                    "&scl=" +
                    scale;
                    
                    var list = "<table class='items'><tr><th>Preview</th><th>Parameters</th></tr>";
                    for (var i = 0; i < items.length; i++) {
                        var rowClass = (i % 2) ? "oddRow" : "evenRow";
                        var selected = (items[i].id == ngembryo.oid) ? true : false;
                        rowClass += selected ? " selected'" : " clickable' onClick='ngembryo.orientation.select(" + items[i].id + ");'";
                        
                        var k = navsrc + "&dst=" +
                        items[i].distance * scale +
                        "&pit=" +
                        items[i].pitch +
                        "&yaw=" +
                        items[i].yaw +
                        "&rol=" +
                        items[i].roll +
                        "&qlt=" +
                        woolz.model.qlt.cur +
                        '&cvt=jpeg';
                        
                        list += "<tr class='" + rowClass + ">";
                        list += "<td>" + "<img style='background: #000000;' height='150px' src='" + k + "' alt='" + items[i].title + "'></img></td>";
                        list += "<td><table>";
                        /*
                         list += "<tr><td class='rowLabel'>Title:</td><td class='rowValue'>" + this.items[i].title + "</td></tr>";
                         list += "<tr><td class='rowLabel'>Description:</td><td class='rowValue'>" + this.items[i].decription + "</td></tr>";
                         */
                        list += "<tr><td class='label'>Distance:</td><td class='value'>" + items[i].distance + "</td></tr>";
                        list += "<tr><td class='label'>Yaw:</td><td class='value'>" + items[i].yaw + "</td></tr>";
                        list += "<tr><td class='label'>Pitch:</td><td class='value'>" + items[i].pitch + "</td></tr>";
                        list += "<tr><td class='label'>Roll:</td><td class='value'>" + items[i].roll + "</td></tr></table></td>";
                        list += "</tr>";
                    }
                    list += "</table>";
                    obd.attr({
                        style: "height: 500px; width: 500px;",
                        content: "<div align='left' style='height: 450px; width: 480px; overflow: auto;'>" + list + "</div>"
                    });
                }
                else {
                    obd.attr({
                        style: "height: 50px; width: 60%;",
                        content: "<div align='left' style='height: 450px; overflow: auto;'>No orientations are currently defined for this model. Please create a new orientation.</div>"
                    });
                }
            }
        });
        
        dojo.body().appendChild(obd.domNode);
        obd.startup();
        obd.show();
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
                ngembryo.controlManager.setDistanceValue(this.items[i].distance);
                ngembryo.controlManager.setYawValue(this.items[i].yaw);
                ngembryo.controlManager.setPitchValue(this.items[i].pitch);
                ngembryo.controlManager.setRollValue(this.items[i].roll);
                ngembryo.oid = id;
                ngembryo.layer.refresh();
                ngembryo.refresh();
                dijit.byId("orientation-browser-dialog").hide();
            }
        }
    }
});
