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
var Resource = new Class({
    initialize: function(){
    },
    
    refresh: function(){
        this.items = null;
        dojo.xhrGet({
            url: "getResources.php?format=json",
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds.*/
            load: function(response, ioArgs){
                if ($defined(response)) {
                    if (response.success) {
                        this.items = response.resources;
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
        var rbd = dijit.byId("resource-browser-dialog");
        if ($defined(rbd)) 
            rbd.destroyRecursive(false);
    },
    
    create: function(){
        var crd = new dijit.Dialog({
            id: "create-resource-dialog",
            title: "Create new resource",
            onHide: function(){
                this.destroyRecursive(false);
            }
        });
        dojo.body().appendChild(crd.domNode);
        crd.startup();
        
        dojo.xhrGet({
            url: "cres.php?",
            handleAs: "text",
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs){
                crd.attr({
                    style: "height: 375px; width: 590px;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                var theForm = dojo.byId("cres");
                dojo.connect(theForm, "onsubmit", function(event){
                    /* prevent the form from actually submitting. */
                    event.preventDefault();
                    /* submit the form in the background */
                    dojo.xhrPost({
                        url: "createResource.php",
                        form: "cres",
                        handleAs: "json",
                        handle: function(data, args){
                            if (typeof data == "error") {
                                console.warn("Error", args);
                            }
                            else {
                                console.log(data);
                            }
                        }
                    });
                    crd.hide();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
        crd.show();
    },
    
    addItem: function(rid){
        var ari = dijit.byId("add-resource-item-dialog");
        if ($defined(ari)) 
            ari.destroyRecursive(false);
        ari = new dijit.Dialog({
            id: "add-resource-item-dialog",
            onHide: function(){
                dojo.byId("resource-detail-dialog").focus();
            }
        });
        dojo.body().appendChild(ari.domNode);
        ari.startup();
        
        dojo.xhrGet({
            url: "crit.php?rid=" + rid,
            handleAs: "text",
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs){
                ari.attr({
                    title: "Create new resource item",
                    style: "height: 375px; width: 590px;",
                    content: "<div align='left' style='height: 450px; overflow: auto;'>" + response + "</div>"
                });
                var theForm = dojo.byId("crit");
                dojo.connect(theForm, "onsubmit", function(event){
                    /* prevent the form from actually submitting. */
                    event.preventDefault();
                    /* submit the form in the background */
                    dojo.xhrPost({
                        url: "createResourceItem.php",
                        form: "crit",
                        handleAs: "json",
                        handle: function(data, args){
                            if (typeof data == "error") {
                                console.warn("Error", args);
                            }
                            else {
                                console.log(data);
                            }
                        }
                    });
                    ari.hide();
                });
            },
            
            error: function(response, ioArgs){
                console.error("HTTP status code: ", ioArgs.xhr.status);
            }
        });
        ari.show();
    },
    
    display: function(){
        var rbd = dijit.byId("resource-browser-dialog");
        if ($defined(rbd)) 
            rbd.destroyRecursive(false);
        var rbd = new dijit.Dialog({
            id: "resource-browser-dialog",
            title: "Registered resources",
            onFocus: function(){
                ngembryo.resource.refresh();
                if ($defined(ngembryo.resource.items) && ngembryo.resource.items.length > 0) {
                    var items = ngembryo.resource.items;
                    var list = "<table class='items'><tr><th>Author</th><th>Title</th><th>Abstract</th></tr>";
                    for (var i = 0; i < items.length; i++) {
                        var rowClass = (i % 2) ? "oddRow" : "evenRow";
                        rowClass += " clickable' onClick='ngembryo.resource.detail(" + items[i].id + ");'";
                        list += "<tr class='" + rowClass + "'>";
                        list += "<td class='author'>" + items[i].author + "</td>";
                        list += "<td class='title'>" + items[i].title + "</td>";
                        list += "<td class='abstract'>" + items[i].description + "</td>";
                        list += "</tr>";
                    }
                    list += "</table>";
                    rbd.attr({
                        style: "height: 500px; width: 500px;",
                        content: "<div align='left' style='height: 450px; width: 480px; overflow: auto;'>" + list + "</div>"
                    });
                }
                else {
                    rbd.attr({
                        style: "height: 50px; width: 60%;",
                        content: "<div align='left' style='height: 450px; overflow: auto;'>No resources are currently defined. Please create a new resource.</div>"
                    });
                }
            }
        });
        dojo.body().appendChild(rbd.domNode);
        rbd.startup();
        rbd.show();
    },
    
    detail: function(id){
        var rdd = dijit.byId("resource-detail-dialog");
        if ($defined(rdd)) 
            rdd.destroyRecursive(false);
        var rdd = new dijit.Dialog({
            id: "resource-detail-dialog",
            title: "Resource details",
            onHide: function(){
                dojo.byId("resource-browser-dialog").focus();
            },
            onFocus: function(){
                ngembryo.resource.refresh();
                if ($defined(ngembryo.resource.items) && ngembryo.resource.items.length > 0) {
                    var items = ngembryo.resource.items;
                    var index = -1;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].id == id) {
                            index = i;
                            break;
                        }
                    }
                    
                    if (index != -1) {
                        var list = "<table class='details'>";
                        list += "<tr><td class='label'>Author:</td><td class='value author'>" + items[i].author + "</td></tr>";
                        list += "<tr><td class='label'>Title:</td><td class='value title'>" + items[i].title + "</td></tr>";
                        list += "<tr><td class='label'>Abstract:</td><td class='value abstract'>" + items[i].description + "</td></tr>";
                        list += "</table><br>";
                        list += "<img class='addItem' alt='Add Item' onClick='ngembryo.resource.addItem(" + items[i].id + ");'><br>";
                        
                        var ritems = items[i].resourceItems;
                        if ($defined(ritems)) {
                            list += "<table class='items'><tr><th>Title</th><th>Abstract</th><th>mime</th><th>Link</th></tr>";
                            for (var i = 0; i < ritems.length; i++) {
                                var rowClass = (i % 2) ? "oddRow" : "evenRow";
                                list += "<tr class='" + rowClass + "'><td class='title'>" + ritems[i].title + "</td><td class='abstract'>" + ritems[i].description + "</td><td class='mime'>" + ritems[i].mime + "</td><td class='link'><a href='" + ritems[i].link + " 'target='_blank'>open</a></td></tr>";
                            }
                            list += "</table>";
                        }
                        rdd.attr({
                            style: "height: 500px; width: 500px;",
                            content: "<div align='left' style='height: 450px; width: 480px; overflow: auto;'>" + list + "</div>"
                        });
                    }
                    else {
                        rdd.attr({
                            style: "height: 50px; width: 60%;",
                            content: "<div align='left' style='height: 450px; overflow: auto;'>Could not find the resource.</div>"
                        });
                    }
                }
                else {
                    rdd.attr({
                        style: "height: 50px; width: 60%;",
                        content: "<div align='left' style='height: 450px; overflow: auto;'>The resource database is currently unavailable.</div>"
                    });
                }
            }
        });
        dojo.body().appendChild(rdd.domNode);
        rdd.startup();
        rdd.show();
    }
});
