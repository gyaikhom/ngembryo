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
            /* Horizontal slider for controlling Zoom. */
            var zc = dojo.create("div", {
                id: "zoomControl"
            }, ctrl);
            var zl = dojo.create("div", {
                id: "zoomLabel",
                innerHTML: "Zoom: "
            }, zc);
            var zv = dojo.create("span", {
                id: "zoomValue"
            }, zc);
            var zsc = dojo.create("div", {
                id: "zoomSliderControl"
            }, zc);
            var zs = dojo.create("div", {
                id: "zoomSlider"
            }, zsc);
            ngembryo.zoomSlider = new Slider($('zoomSliderControl'), $('zoomSlider'), {
                steps: 9, // 10 steps starting at 0.
                wheel: 1,
                onChange: function(step){
                    $('zoomValue').set('html', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['scl'], [step], true, 'mouse');
                },
                onComplete: function(step){
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['scl'], [step], false, 'mouse');
                }
            }).set(0);
        }
        if (controls.dst) {
            /* Horizontal slider for controlling dst. */
            var dc = dojo.create("div", {
                id: "dstControl"
            }, ctrl);
            var dl = dojo.create("div", {
                id: "dstLabel",
                innerHTML: "Distance: "
            }, dc);
            var dv = dojo.create("span", {
                id: "dstValue"
            }, dc);
            var dsc = dojo.create("div", {
                id: "dstSliderControl"
            }, dc);
            var ds = dojo.create("div", {
                id: "dstSlider"
            }, dsc);
            ngembryo.dstSlider = new Slider($('dstSliderControl'), $('dstSlider'), {
                steps: 9, // 10 steps starting at 0.
                wheel: 1,
                onChange: function(step){
                    $('dstValue').set('html', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['dst'], [step], true, 'dstSlider');
                },
                onComplete: function(step){
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['dst'], [step], false, 'dstSlider');
                }
            }).set(0);
        }
        if (controls.left) {
        }
        if (controls.right) {
        }
        if (controls.up) {
        }
        if (controls.roi) {
            /* Container for label and control. */
            var r = dojo.create("div", {
                id: "roi"
            }, ctrl);
            /* Label displayed next to control. */
            var rl = dojo.create("div", {
                id: "roiLabel",
                innerHTML: "Region of interest: "
            }, r);
            /* Container for the control components. */
            var rc = dojo.create("div", {
                id: "roiControl"
            }, r);
        }
        if (controls.sec) {
            /* Container for label and control. */
            var s = dojo.create("div", {
                id: "sec"
            }, ctrl);
            /* Label displayed next to control. */
            var sl = dojo.create("div", {
                id: "secLabel",
                innerHTML: "Section plane orientation: "
            }, s);
            /* Container for the control components. */
            var sc = dojo.create("div", {
                id: "secControl"
            }, s);
            
            /* Horizontal slider for controlling Pitch. */
            var pc = dojo.create("div", {
                id: "pitchControl"
            }, ctrl);
            var pl = dojo.create("div", {
                id: "pitchLabel",
                innerHTML: "Pitch: "
            }, pc);
            var pv = dojo.create("span", {
                id: "pitchValue"
            }, pc);
            var psc = dojo.create("div", {
                id: "pitchSliderControl"
            }, pc);
            var ps = dojo.create("div", {
                id: "pitchSlider"
            }, psc);
            ngembryo.pitchSlider = new Slider($('pitchSliderControl'), $('pitchSlider'), {
                steps: 179, // 180 steps starting at 0.
                wheel: 1,
                onChange: function(step){
                    $('pitchValue').set('html', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['pit'], [step], true, 'sectionplane');
                },
                onComplete: function(step){
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['pit'], [step], false, 'sectionplane');
                }
            }).set(0);
            
            /* Horizontal slider for controlling Yaw. */
            var yc = dojo.create("div", {
                id: "yawControl"
            }, ctrl);
            var yl = dojo.create("div", {
                id: "yawLabel",
                innerHTML: "Yaw: "
            }, yc);
            var yv = dojo.create("span", {
                id: "yawValue"
            }, yc);
            var ysc = dojo.create("div", {
                id: "yawSliderControl"
            }, yc);
            var ys = dojo.create("div", {
                id: "yawSlider"
            }, ysc);
            ngembryo.yawSlider = new Slider($('yawSliderControl'), $('yawSlider'), {
                steps: 359, // 360 steps starting at 0.
                wheel: 1,
                onChange: function(step){
                    $('yawValue').set('html', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['yaw'], [step], true, 'sectionplane');
                },
                onComplete: function(step){
                    $('yawValue').set('html', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['yaw'], [step], false, 'sectionplane');
                }
            }).set(0);
        }
        
        /* Toggle view of controls panel. */
        var tcv = dojo.create("div", {
            id: "toggleControls",
            innerHTML: "Hide controls panel"
        }, ctrl);
        dojo.connect(tcv, "onclick", function(){
            var h = dojo.style('controls', 'height') + 1;
            var t = dojo.style('controls', 'top');
            if (ngembryo.engine.isControlsVisible()) {
                dojo.fx.slideTo({
                    node: 'controls',
                    top: t - h,
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
                    top: t + h,
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
