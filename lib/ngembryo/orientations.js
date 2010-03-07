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
        this.dialog = new dijit.Dialog({
            id: "orientations-dialog"
        });
        dojo.body().appendChild(dialog.domNode);
        dialog.startup();
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
                        if ($defined(this.items) && this.items.length > 0) {
                            if (ngembryo.oid == -1) 
                                ngembryo.oid = this.items[0].id;
                            this.select(ngembryo.oid);
                        }
                        else 
                            ngembryo.oid = -1;
                    }
                    else {
                        if (response.errcode < 0) {
                            alert(response.message);
                        }
                        else {
                            console.error(response.message);
                        }
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
        this.dialog.destroyRecursive(false);
        console.info("Dialog destroyed.");
    },
    
    create: function(){
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
                dialog.attr({
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
                    dialog.hide();
                    ngembryo.engine.refresh();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
        dialog.show();
    },
    
    display: function(){
        this.refresh();
        if ($defined(this.items) && this.items.length > 0) {
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
            
            var list = "<table id='orientationBrowser'>";
            for (var i = 0; i < this.items.length; i++) {
                var rowClass = (i % 2) ? "oddRow" : "evenRow";
                var selected = (this.items[i].id == ngembryo.oid) ? true : false;
                rowClass += selected ? "Selected'" : "' onClick='ngembryo.orientation.select(" + this.items[i].id + ");'";
                
                var k = navsrc + "&dst=" +
                this.items[i].distance * scale +
                "&pit=" +
                this.items[i].pitch +
                "&yaw=" +
                this.items[i].yaw +
                "&rol=" +
                this.items[i].roll +
                "&qlt=" +
                woolz.model.qlt.cur +
                '&cvt=jpeg';
                
                list += "<tr class='" + rowClass + ">";
                list += "<td>" + "<img style='background: #000000;' height='150px' src='" + k + "' alt='" + this.items[i].title + "'></img></td>";
                list += "<td><table>";
                /*
                 list += "<tr><td class='rowLabel'>Title:</td><td class='rowValue'>" + this.items[i].title + "</td></tr>";
                 list += "<tr><td class='rowLabel'>Description:</td><td class='rowValue'>" + this.items[i].decription + "</td></tr>";
                 */
                list += "<tr><td class='rowLabel'>Distance:</td><td class='rowValue'>" + this.items[i].distance + "</td></tr>";
                list += "<tr><td class='rowLabel'>Yaw:</td><td class='rowValue'>" + this.items[i].yaw + "</td></tr>";
                list += "<tr><td class='rowLabel'>Pitch:</td><td class='rowValue'>" + this.items[i].pitch + "</td></tr>";
                list += "<tr><td class='rowLabel'>Roll:</td><td class='rowValue'>" + this.items[i].roll + "</td></tr></table></td>";
                list += "</tr>";
            }
            list += "</table>";
            dialog.attr({
                title: "Select orientation",
                style: "height: 500px; width: 500px;",
                content: "<div align='left' style='height: 450px; width: 480px; overflow: auto;'>" + list + "</div>"
            });
        }
        else {
            dialog.attr({
                title: "Select orientation",
                style: "height: 50px; width: 60%;",
                content: "<div align='left' style='height: 450px; overflow: auto;'>No orientations are currently defined for this model. Please create a new orientation.</div>"
            });
        }
        dialog.show();
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
                dialog.hide();
            }
        }
    }
});
