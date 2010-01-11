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
 * @classDescription This class encapsulates the controls.
 *
 * Overlay controls are used to navigate the annotation layer.
 * Navigation events received by the control layer will be passed
 * on to the background layer (which could be external). For
 * instance, when the annotation engine is used with an embryology
 * atlas, any dragging event received by the control manager will
 * be passed on to the embryology controller.
 */
var ControlManager = new Class({
    /**
     * Initialises the control manager by creating the overlay controls
     * if it is turned on.
     *
     * @param {Object} controls Controls and their active status.
     */
    initialize: function(controls){
        var ctrl = dojo.byId("controls");
        if (controls.zoom) {
            /* Container for label and control. */
            var z = dojo.create("div", {
                id: "zoom"
            }, ctrl);
            /* Label displayed next to control. */
            var l = dojo.create("div", {
                id: "zoomLabel",
                innerHTML: "Zoom: "
            }, z);
            /* Container for the control components. */
            var zc = dojo.create("div", {
                id: "zoomControl"
            }, z);
            /* Rules node. */
            var rn = dojo.create("div", {
                id: "zoomRulesNode"
            }, zc);
            /* Slider rules. */
            var sr = new dijit.form.HorizontalRule({
                id: "zoomSliderRules",
                count: 10,
                style: "height:10px; width:300px;"
            }, rn);
            /* Horizontal slider. */
            var sl = new dijit.form.HorizontalSlider({
                name: "zoomSlider",
                value: 6,
                minimum: 1,
                maximum: 10,
                discreteValues: 10,
                intermediateChanges: true,
                style: "height:10px; width: 300px;"
            }, zc);
        }
        if (controls.left) {
        }
        if (controls.right) {
        }
        if (controls.up) {
        
        }
        if (controls.down) {
        
        }
        
        /* Toggle view of controls panel. */
        var tcv = dojo.create("div", {
            id: "toggleControls",
            innerHTML: "Hide controls panel"
        }, ctrl);
        dojo.connect(tcv, "onclick", function(){
            if (ngembryo.engine.isControlsVisible()) {
                dojo.fx.slideTo({
                    node: 'controls',
                    top: -202,
                    left: 0,
                    unit: "px",
                    duration: 350,
                    easing: dojo.fx.easing["quadInOut"]
                }).play();
                ngembryo.engine.hideControls();
                dojo.attr(this, "innerHTML", "Show controls panel");
            }
            else {
                dojo.fx.slideTo({
                    node: 'controls',
                    top: 0,
                    left: 0,
                    unit: "px",
                    duration: 350,
                    easing: dojo.fx.easing["quadInOut"]
                }).play();
                dojo.attr(this, "innerHTML", "Hide controls panel");
                ngembryo.engine.showControls();
            }
        });
        
        /* Display the controls panel. */
        ngembryo.engine.showControls();
    }
});
