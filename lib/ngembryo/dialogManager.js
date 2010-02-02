/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh
 * Funded by the JISC (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */
/**
 * @classDescription This class encapsulates a dialog manager.
 *
 * The dialog manager maintains all of the dialogs that are used by
 * the Dojo application. These include help information, about
 * information etc., which could change over time. By using Dojo.xhr
 * Ajax interfaces, we can dynamically load these information at run-time
 * thus providing up-to-date information on the dialog panels.
 */
var DialogManager = new Class({
    initialize: function(){
        dialog = new dijit.Dialog({
		id: "dialog"
        });
        dojo.body().appendChild(dialog.domNode);
        dialog.startup();
    },
    
    /**
     * Sets the about information.
     */
    setAboutDialog: function(){
        dojo.xhrGet({
            url: "about.html",
            handleAs: "text",
            timeout: 5000, // Time in milliseconds
            load: function(response, ioArgs){
                dialog.attr({
                    title: "About: Information about the Next-Generation Embryology Project",
                    style: "height: 500px; width: 60%;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                return response;
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
                return response;
            }
        });
    },
    
    /**
     * Sets the help information.
     */
    setHelpDialog: function(){
        dojo.xhrGet({
            url: "help.html",
            handleAs: "text",
            timeout: 5000, // Time in milliseconds
            load: function(response, ioArgs){
                dialog.attr({
                    title: "Help: Users' manual on using the portal",
                    style: "height: 500px; width: 80%;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                return response;
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
                return response;
            }
        });
    },
    
    /**
     * Sets the 2D marker creation dialog.
     *
     * @param {Object} x x-coordinate of the marker.
     * @param {Object} y y-coordinate of the marker.
     */
    setCreate2DMarkerDialog: function(x, y, scale, dst, yaw, rol, pit){
        dojo.xhrGet({
            url: "c2dm.php?x=" + x + "&y=" + y + "&scale=" + scale + "&dst=" + dst + "&yaw=" + yaw + "&rol=" + rol + "&pit=" + pit,
            handleAs: "text",
            timeout: 5000, // Time in milliseconds
            load: function(response, ioArgs){
                dialog.attr({
                    title: "Create 2D marker at (" + x + ", " + y + ")",
                    style: "height: 500px; width: 80%;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                var theForm = dojo.byId("c2dm");
                dojo.connect(theForm, "onsubmit", function(event){
                    // prevent the form from actually submitting
                    event.preventDefault();
                    // submit the form in the background   
                    dojo.xhrPost({
                        url: "create2DMarker.php",
                        form: "c2dm",
                        handleAs: "text",
                        handle: function(data, args){
                            if (typeof data == "error") {
                                console.warn("Error", args);
                            }
                            else {
                                console.log(data);
                            }
                        }
                    });
                    dijit.byId('dialog').hide();
                    ngembryo.engine.refresh();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
    },
    
    /**
     * Sets the 2D region creation dialog.
     */
    setCreate2DRegionDialog: function(polyline, scale, dst, yaw, rol, pit){
        var str = "";
        var i = 0;
        if (i < polyline.length) {
            while (1) {
                str += polyline[i].x + "," + polyline[i].y;
                i++;
                if (i < polyline.length) {
                    str += ":";
                }
                else {
                    break;
                }
            }
        }
        dojo.xhrGet({
            url: "c2dr.php?polyline=" + str + "&scale=" + scale + "&dst=" + dst + "&yaw=" + yaw + "&rol=" + rol + "&pit=" + pit,
            handleAs: "text",
            timeout: 5000, // Time in milliseconds
            load: function(response, ioArgs){
                dialog.attr({
                    title: "Create 2D region",
                    style: "height: 500px; width: 80%;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                var theForm = dojo.byId("c2dr");
                dojo.connect(theForm, "onsubmit", function(event){
                    // prevent the form from actually submitting
                    event.preventDefault();
                    // submit the form in the background   
                    dojo.xhrPost({
                        url: "create2DRegion.php",
                        form: "c2dr",
                        handleAs: "text",
                        handle: function(data, args){
                            if (typeof data == "error") {
                                console.warn("Error", args);
                            }
                            else {
                                console.log(data);
                            }
                        }
                    });
                    dijit.byId('dialog').hide();
                    ngembryo.engine.refresh();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
    },
    
    /**
     * Parses the response data and retrieves list of resources.
     *
     * @param {Object} JSON response.
     */
    __parseResources: function(data){
        content = "<div><ul>";
        for (var i = 0; i < data.length; i++) {
            content += "<li>" + data[i].id + data[i].title + data[i].summary + data[i].url + "</li>";
        }
        content += "</ul></div>";
        return content;
    },
    
    /**
     * Retrieve resource information from the repository.
     */
    setResourceGrid: function(id, label, description, type){
        var store = new dojox.data.CsvStore({
            url: "getResource.php?id=" + id + "&type=" + type + "&format=csv"
        });
        var layout = [{
            field: 'id',
            name: 'id',
            width: '20px'
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
        }];
        var grid = new dojox.grid.DataGrid({
            query: {
                id: '*'
            },
            store: store,
            clientSort: true,
            rowSelector: '20px',
            structure: layout
        });
        
		var c = dojo.create("div");
		var d = dojo.create("div");
        dojo.attr(d, {
            id: "description",
            style: "text-align: left; height: 150px; width: 100%;",
            innerHTML: "<b>Description: </b>" + description
        });
        c.appendChild(d);
        
        var t = dojo.create("div");
        dojo.attr(t, {
            id: "resourceGrid",
            style: "height: 350px; width: 100%;"
        });
        t.appendChild(grid.domNode);
        c.appendChild(t);
        grid.startup();
        
        dialog.attr({
            title: label,
            style: "height: 500px; width: 60%;",
            content: c
        });
        
    },
    
    /**
     * Displays the about dialog box.
     */
    showAbout: function(){
        this.setAboutDialog();
        dialog.show();
    },
    
    /**
     * Displays the help dialog box.
     */
    showHelp: function(){
        this.setHelpDialog();
        dialog.show();
    },
    
    /**
     * Displays the resources associated with an annotation.
     */
    showResources: function(id, label, description, type){
        this.setResourceGrid(id, label, description, type);
        dialog.show();
    },
    
    /**
     * Creates a 2D marker at the specified coordinate.
     *
     * @param {Object} x x-coordinate of the marker.
     * @param {Object} y y-coordinate of the marker.
     */
    create2DMarker: function(x, y, scale, dst, yaw, rol, pit){
        this.setCreate2DMarkerDialog(x, y, scale, dst, yaw, rol, pit);
        dialog.show();
    },
    
    /**
     * Creates a 2D region using the specified polyline.
     *
     * @param {Object} p Points in the polyline.
     */
    create2DRegion: function(p, scale, dst, yaw, rol, pit){
        this.setCreate2DRegionDialog(p, scale, dst, yaw, rol, pit);
        dialog.show();
    }
    
    
});
