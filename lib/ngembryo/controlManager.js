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
        this.controls = controls;
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
            var zv = dojo.create("input", {
                id: "zoomValue",
				type: "text"
            }, zc);
            var zd = dojo.create("div", {
                id: "zoomSliderDecrement",
                innerHTML: "-"
            }, zc);
            var zsc = dojo.create("div", {
                id: "zoomSliderControl"
            }, zc);
            var zs = dojo.create("div", {
                id: "zoomSlider"
            }, zsc);
            var zi = dojo.create("div", {
                id: "zoomSliderIncrement",
                innerHTML: "+"
            }, zc);
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
            var dv = dojo.create("input", {
                id: "dstValue",
                type: "text"
            }, dc);
            var dd = dojo.create("div", {
                id: "dstSliderDecrement",
                innerHTML: "-"
            }, dc);
            var dsc = dojo.create("div", {
                id: "dstSliderControl"
            }, dc);
            var ds = dojo.create("div", {
                id: "dstSlider"
            }, dsc);
            var di = dojo.create("div", {
                id: "dstSliderIncrement",
                innerHTML: "+"
            }, dc);
        }
        if (controls.navigator) {
            var nc = dojo.create("div", {
                id: "navigatorControl"
            }, ctrl);
            var nl = dojo.create("div", {
                id: "navigatorLabel",
                innerHTML: "Navigator: "
            }, nc);
            var nb = dojo.create("div", {
                id: "navigatorButtons"
            }, nc);
            var nLeft = dojo.create("div", {
                id: "navigatorLeft"
            }, nb);
            var nRight = dojo.create("div", {
                id: "navigatorRight"
            }, nb);
            var nUp = dojo.create("div", {
                id: "navigatorUp"
            }, nb);
            var nDown = dojo.create("div", {
                id: "navigatorDown"
            }, nb);
            dojo.connect(nLeft, "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.xfit) {
                    var x = 0.5;
                    var t = woolz.locator.zone.offsetLeft - 15; // Decrement for every button press.
                    if (t < 0) 
                        t = 0;
                    x = (t + woolz.locator.zonewidth / 2) / woolz.locator.navwidth;
                    woolz.locator.zone.style.left = t + "px";
                    woolz.model.setVals(['x'], [x], false, 'locator');
                }
            });
            dojo.connect(nRight, "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.xfit) {
                    var x = 0.5;
                    var t = woolz.locator.zone.offsetLeft + 15;
                    var j = woolz.locator.navwidth - woolz.locator.zonewidth;
                    if (t > j) 
                        t = j;
                    x = (t + woolz.locator.zonewidth / 2) / woolz.locator.navwidth;
                    woolz.locator.zone.style.left = t + "px";
                    woolz.model.setVals(['x'], [x], false, 'locator');
                }
            });
            dojo.connect(nUp, "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.yfit) {
                    var y = 0.5;
                    var t = woolz.locator.zone.offsetTop - 15;
                    if (t < 0) 
                        t = 0;
                    y = (t + woolz.locator.zoneheight / 2) / woolz.locator.navheight;
                    woolz.locator.zone.style.top = t + "px";
                    woolz.model.setVals(['y'], [y], false, 'locator');
                }
            });
            dojo.connect(nDown, "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.yfit) {
                    var y = 0.5;
                    var t = woolz.locator.zone.offsetTop + 15;
                    var j = woolz.locator.navheight - woolz.locator.zoneheight;
                    if (t > j) 
                        t = j;
                    y = (t + woolz.locator.zoneheight / 2) / woolz.locator.navheight;
                    woolz.locator.zone.style.top = t + "px";
                    woolz.model.setVals(['y'], [y], false, 'locator');
                }
            });
            
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
                innerHTML: "Section plane: "
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
            var pv = dojo.create("input", {
                id: "pitchValue",
                type: "text"
            }, pc);
            var pd = dojo.create("div", {
                id: "pitchSliderDecrement",
                innerHTML: "-"
            }, pc);
            var psc = dojo.create("div", {
                id: "pitchSliderControl"
            }, pc);
            var ps = dojo.create("div", {
                id: "pitchSlider"
            }, psc);
            var pi = dojo.create("div", {
                id: "pitchSliderIncrement",
                innerHTML: "+"
            }, pc);
            
            /* Horizontal slider for controlling Yaw. */
            var yc = dojo.create("div", {
                id: "yawControl"
            }, ctrl);
            var yl = dojo.create("div", {
                id: "yawLabel",
                innerHTML: "Yaw: "
            }, yc);
            var yv = dojo.create("input", {
                id: "yawValue",
                type: "text"
            }, yc);
            var yd = dojo.create("div", {
                id: "yawSliderDecrement",
                innerHTML: "-"
            }, yc);
            var ysc = dojo.create("div", {
                id: "yawSliderControl"
            }, yc);
            var ys = dojo.create("div", {
                id: "yawSlider"
            }, ysc);
            var yi = dojo.create("div", {
                id: "yawSliderIncrement",
                innerHTML: "+"
            }, yc);
            
            /* Horizontal slider for controlling Roll. */
            var xc = dojo.create("div", {
                id: "rollControl"
            }, ctrl);
            var xl = dojo.create("div", {
                id: "rollLabel",
                innerHTML: "Roll: "
            }, xc);
            var xv = dojo.create("input", {
                id: "rollValue",
                type: "text"
            }, xc);
            var xd = dojo.create("div", {
                id: "rollSliderDecrement",
                innerHTML: "-"
            }, xc);
            var xsc = dojo.create("div", {
                id: "rollSliderControl"
            }, xc);
            var xs = dojo.create("div", {
                id: "rollSlider"
            }, xsc);
            var xi = dojo.create("div", {
                id: "rollSliderIncrement",
                innerHTML: "+"
            }, xc);
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
    },
    
    startup: function(){
        ngembryo.controlReady = true;
        if (this.controls.zoom) {
            /* Horizontal slider for controlling Zoom. */
            var sclMin = Math.round(woolz.model.scl.min * 100) / 100;
            var sclMax = Math.round(woolz.model.scl.max * 100) / 100;
            var sclCur = Math.round(woolz.model.scl.cur * 100) / 100;
            var rangeHigh = Math.log(sclMax) / Math.LN2;
            var rangeLow = Math.log(sclMin) / Math.LN2;
            var curTick = Math.log(sclCur) / Math.LN2;
            console.info("max, min, cur, r1, r2, tick:" + sclMax + "," + sclMin + "," + sclCur + "," + rangeLow + "," + rangeHigh + "," + curTick);
            $('zoomValue').set('value', sclCur);
            ngembryo.zoomSlider = new Slider($('zoomSliderControl'), $('zoomSlider'), {
                range: [rangeLow, rangeHigh],
                snap: true,
                wheel: true,
                onChange: function(step){
                    var scl = Math.pow(2, step);
                    $('zoomValue').set('value', scl);
                    if ($defined(woolz) && $defined(woolz.model)) {
                        woolz.model.setVals(['scl'], [scl], true, 'mouse');
                    }
                },
                onComplete: function(step){
                    var scl = Math.pow(2, step);
                    $('zoomValue').set('value', scl);
                    if ($defined(woolz) && $defined(woolz.model)) {
                        woolz.model.setVals(['scl'], [scl], false, 'mouse');
                    }
                }
            }).set(curTick);
            dojo.connect(dojo.byId("zoomValue"), "onchange", function(value){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var l = ngembryo.zoomSlider.range[0];
                    var h = ngembryo.zoomSlider.range[1];
                    var n = Math.log(this.value) / Math.LN2;
                    if (n < l) 
                        n = l;
                    if (n > h) 
                        n = h;
                    this.value = n;
                    ngembryo.zoomSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("zoomSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.zoomSlider.step - 1;
                    var l = ngembryo.zoomSlider.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.zoomSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("zoomSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.zoomSlider.step + 1;
                    var h = ngembryo.zoomSlider.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.zoomSlider.set(n);
                }
            });
        }
        if (this.controls.dst) {
            /* Horizontal slider for controlling dst. */
            var dstMin = Math.round(woolz.model.dst.min * 100) / 100;
            var dstMax = Math.round(woolz.model.dst.max * 100) / 100;
            var dstCur = Math.round(woolz.model.dst.cur * 100) / 100;
            ngembryo.dstSlider = new Slider($('dstSliderControl'), $('dstSlider'), {
                range: [dstMin, dstMax],
                snap: true,
                steps: dstMax - dstMin,
                wheel: 1,
                onChange: function(step){
                    $('dstValue').set('value', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['dst'], [step], true, 'dstSlider');
                },
                onComplete: function(step){
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['dst'], [step], false, 'dstSlider');
                }
            }).set(dstCur);
            dojo.connect(dojo.byId("dstValue"), "onchange", function(value){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var l = ngembryo.dstSlider.range[0];
                    var h = ngembryo.dstSlider.range[1];
                    var n = this.value;
                    if (n < l) 
                        n = l;
                    if (n > h) 
                        n = h;
                    ngembryo.dstSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("dstSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.dstSlider.step - 1;
                    var l = ngembryo.dstSlider.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.dstSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("dstSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.dstSlider.step + 1;
                    var h = ngembryo.dstSlider.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.dstSlider.set(n);
                }
            });
        }
        if (this.controls.roi) {
            ngembryo.pitchSlider = new Slider($('pitchSliderControl'), $('pitchSlider'), {
                range: [0, 179],
                snaps: true,
                steps: 180,
                wheel: 1,
                onChange: function(step){
                    $('pitchValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['pit'], [step], true, 'sectionplane');
                    }
                },
                onComplete: function(step){
                    $('pitchValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['pit'], [step], false, 'sectionplane');
                    }
                }
            }).set(0);
            dojo.connect(dojo.byId("pitchValue"), "onchange", function(value){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var l = ngembryo.pitchSlider.range[0];
                    var h = ngembryo.pitchSlider.range[1];
                    var n = this.value;
                    if (n < l) 
                        n = l;
                    if (n > h) 
                        n = h;
                    ngembryo.pitchSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("pitchSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.pitchSlider.step - 1;
                    var l = ngembryo.pitchSlider.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.pitchSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("pitchSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.pitchSlider.step + 1;
                    var h = ngembryo.pitchSlider.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.pitchSlider.set(n);
                }
            });
            ngembryo.yawSlider = new Slider($('yawSliderControl'), $('yawSlider'), {
                range: [0, 359],
                snaps: true,
                steps: 360,
                wheel: 1,
                onChange: function(step){
                    $('yawValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['yaw'], [step], true, 'sectionplane');
                    }
                },
                onComplete: function(step){
                    $('yawValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['yaw'], [step], false, 'sectionplane');
                    }
                }
            }).set(0);
            dojo.connect(dojo.byId("yawValue"), "onchange", function(value){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var l = ngembryo.yawSlider.range[0];
                    var h = ngembryo.yawSlider.range[1];
                    var n = this.value;
                    if (n < l) 
                        n = l;
                    if (n > h) 
                        n = h;
                    ngembryo.yawSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("yawSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.yawSlider.step - 1;
                    var l = ngembryo.yawSlider.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.yawSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("yawSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.yawSlider.step + 1;
                    var h = ngembryo.yawSlider.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.yawSlider.set(n);
                }
            });
            ngembryo.rollSlider = new Slider($('rollSliderControl'), $('rollSlider'), {
                range: [0, 359],
                snaps: true,
                steps: 360,
                wheel: 1,
                onChange: function(step){
                    $('rollValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['rol'], [step], true, 'sectionplane');
                    }
                },
                onComplete: function(step){
                    $('rollValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['rol'], [step], false, 'sectionplane');
                    }
                }
            }).set(0);
            dojo.connect(dojo.byId("rollValue"), "onchange", function(value){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var l = ngembryo.rollSlider.range[0];
                    var h = ngembryo.rollSlider.range[1];
                    var n = this.value;
                    if (n < l) 
                        n = l;
                    if (n > h) 
                        n = h;
                    ngembryo.rollSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("rollSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.rollSlider.step - 1;
                    var l = ngembryo.rollSlider.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.rollSlider.set(n);
                }
            });
            dojo.connect(dojo.byId("rollSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.rollSlider.step + 1;
                    var h = ngembryo.rollSlider.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.rollSlider.set(n);
                }
            });
        }
        /* Display the controls panel. */
        ngembryo.engine.showControls();
    }
});
