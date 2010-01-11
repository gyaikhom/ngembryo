/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh
 * Funded by the JISC (http:// www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */
/**
 * @classDescription This class encapsulates the information tipper.
 *
 * The information tipper is activated when the mouse hovers over an
 * annotation: either markers or regions. When regions are highlighted,
 * the tipper follows the mouse pointer.
 */
var Tipper = new Class({
    initialize: function(c){
        var f = dojo.create("div", {
            id: "tipper",
            style: "position: fixed; top: 0px; left: 0px; visibility: hidden;"
        }, c);
        dojo.create("div", {
            id: "tipperLabel",
            innerHTML: null
        }, f);
        dojo.create("div", {
            id: "tipperDescription",
            innerHTML: null
        }, f);
    },
    show: function(l, d){
        dojo.attr("tipperLabel", {
            innerHTML: l
        });
        dojo.attr("tipperDescription", {
            innerHTML: d
        });
        dojo.attr("tipper", "style", {
            visibility: "visible",
        });
    },
    hide: function(){
        dojo.attr("tipper", "style", {
            visibility: "hidden"
        });
    },
    move: function(x, y){
        var left = false;
        var up = false;
        
        /* These values, 300 and 165, are the width and height of the
         * tipper <div>, and they come from ngembryo.css. */
        if (x + 300 > ngembryo.engine.dim.w) 
            left = true;
        if (y + 165 > ngembryo.engine.dim.h) 
            up = true;
        
        /* -(300 + 10), with horizontal adjustment for mouse pointer icon.
         * -(165 + 5), with vertical adjustment for mouse pointer icon.
         */
        var l = (left ? -310 : 15);
        var t = (up ? -170 : 15);
        
        var ft = dojo.byId("tipper");
        dojo.fx.slideTo({
            node: ft,
            left: x + l,
            top: y + t,
            unit: "px",
            duration: 1
        }).play();
    },
    destroy: function(){
        dojo.destroy("tipperDescription");
        dojo.destroy("tipperLabel");
        dojo.destroy("tipper");
    }
});
