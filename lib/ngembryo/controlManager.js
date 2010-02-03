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
            var zv = dojo.create("span", {
                id: "zoomValue"
            }, zc);
            var zsc = dojo.create("div", {
                id: "zoomSliderControl"
            }, zc);
            var zs = dojo.create("div", {
                id: "zoomSlider"
            }, zsc);
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
            var pv = dojo.create("span", {
                id: "pitchValue"
            }, pc);
            var psc = dojo.create("div", {
                id: "pitchSliderControl"
            }, pc);
            var ps = dojo.create("div", {
                id: "pitchSlider"
            }, psc);
            
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
			$('zoomValue').set('html', sclCur);
            ngembryo.zoomSlider = new Slider($('zoomSliderControl'), $('zoomSlider'), {
                range: [rangeLow, rangeHigh],
                snap: true,
                wheel: true,
                onChange: function(step){
                    var scl = Math.pow(2, step);
                    $('zoomValue').set('html', scl);
                    if ($defined(woolz) && $defined(woolz.model)) {
                        woolz.model.setVals(['scl'], [scl], true, 'mouse');
                    }
                },
                onComplete: function(step){
                    var scl = Math.pow(2, step);
                    $('zoomValue').set('html', scl);
                    if ($defined(woolz) && $defined(woolz.model)) {
                        woolz.model.setVals(['scl'], [scl], false, 'mouse');
                    }
                }
            }).set(curTick);
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
                    $('dstValue').set('html', step);
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['dst'], [step], true, 'dstSlider');
                },
                onComplete: function(step){
                    if ($defined(woolz) && $defined(woolz.model)) 
                        woolz.model.setVals(['dst'], [step], false, 'dstSlider');
                }
            }).set(dstCur);
        }
        if (this.controls.roi) {
            ngembryo.pitchSlider = new Slider($('pitchSliderControl'), $('pitchSlider'), {
                range: [0, 179],
                snaps: true,
                steps: 180,
                wheel: 1,
                onChange: function(step){
                    if (ngembryo.setByUser) {
                        $('pitchValue').set('html', step);
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['pit'], [step], true, 'sectionplane');
                    }
                },
                onComplete: function(step){
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['pit'], [step], false, 'sectionplane');
                    }
                }
            }).set(0);
            ngembryo.yawSlider = new Slider($('yawSliderControl'), $('yawSlider'), {
                range: [0, 359],
                snaps: true,
                steps: 360,
                wheel: 1,
                onChange: function(step){
                    if (ngembryo.setByUser) {
                        $('yawValue').set('html', step);
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['yaw'], [step], true, 'sectionplane');
                    }
                },
                onComplete: function(step){
                    if (ngembryo.setByUser) {
                        $('yawValue').set('html', step);
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['yaw'], [step], false, 'sectionplane');
                    }
                }
            }).set(0);
        }
        /* Display the controls panel. */
        ngembryo.engine.showControls();
    }
});
