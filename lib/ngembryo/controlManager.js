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
 * Overlay controls are used to navigate the annotation layer. Navigation events
 * received by the control layer will be passed on to the background layer
 * (which could be external). For instance, when the annotation engine is used
 * with an embryology atlas, any dragging event received by the control manager
 * will be passed on to the embryology controller.
 */
var ControlManager = new Class({
    /**
     * Initialises the control manager by creating the overlay controls if it is
     * turned on.
     *
     * @param {Object}
     *            controls Controls and their active status.
     */
    initialize: function(controls){
        this.controls = controls;
        /*
         * We register all of the event connections, so that they can be
         * disconnected easily.
         */
        this.connections = new Array();
        var ctrl = dojo.byId("controls");

        /* Shows the current model. */
        var model = dojo.create("div", {
            id: "control-model"
        }, ctrl);
        var modelLabel = dojo.create("div", {
            id: "control-model-label",
            innerHTML: "Model: "
        }, model);
        var modelValue = dojo.create("div", {
            id: "control-model-value",
            innerHTML: "select model..."
        }, model);

        /* Shows the current layer. */
        var layer = dojo.create("div", {
            id: "control-layer"
        }, ctrl);
        var layerLabel = dojo.create("div", {
            id: "control-layer-label",
            innerHTML: "Layer: "
        }, layer);
        var layerValue = dojo.create("div", {
            id: "control-layer-value",
            innerHTML: "select layer..."
        }, layer);

        if (controls.zoom) {
            /* Horizontal slider for controlling Zoom. */
            var zc = dojo.create("div", {
                id: "zoomControl"
            }, ctrl);
            var zsc = dojo.create("div", {
                id: "zoomSliderControl"
            }, zc);
            var zs = dojo.create("div", {
                id: "zoomSlider"
            }, zsc);
            var zi = dojo.create("div", {
                id: "zoomSliderIncrement"
            }, zc);
            var zv = dojo.create("input", {
                id: "zoomValue",
                type: "text"
            }, zc);
            var zd = dojo.create("div", {
                id: "zoomSliderDecrement"
            }, zc);
            var zl = dojo.create("div", {
                id: "zoomLabel",
                innerHTML: "Zoom: "
            }, zc);
        }
        if (controls.dst) {
            /* Horizontal slider for controlling dst. */
            var dc = dojo.create("div", {
                id: "dstControl"
            }, ctrl);
            var dsc = dojo.create("div", {
                id: "dstSliderControl"
            }, dc);
            var ds = dojo.create("div", {
                id: "dstSlider"
            }, dsc);
            var di = dojo.create("div", {
                id: "dstSliderIncrement"
            }, dc);
            var dv = dojo.create("input", {
                id: "dstValue",
                type: "text"
            }, dc);
            var dd = dojo.create("div", {
                id: "dstSliderDecrement"
            }, dc);
            var dl = dojo.create("div", {
                id: "dstLabel",
                innerHTML: "Distance: "
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
            var psc = dojo.create("div", {
                id: "pitchSliderControl"
            }, pc);
            var ps = dojo.create("div", {
                id: "pitchSlider"
            }, psc);
            var pi = dojo.create("div", {
                id: "pitchSliderIncrement"
            }, pc);
            var pv = dojo.create("input", {
                id: "pitchValue",
                type: "text"
            }, pc);
            var pd = dojo.create("div", {
                id: "pitchSliderDecrement"
            }, pc);
            var pl = dojo.create("div", {
                id: "pitchLabel",
                innerHTML: "Pitch: "
            }, pc);
            
            /* Horizontal slider for controlling Yaw. */
            var yc = dojo.create("div", {
                id: "yawControl"
            }, ctrl);
            var ysc = dojo.create("div", {
                id: "yawSliderControl"
            }, yc);
            var ys = dojo.create("div", {
                id: "yawSlider"
            }, ysc);
            var yi = dojo.create("div", {
                id: "yawSliderIncrement"
            }, yc);
            var yv = dojo.create("input", {
                id: "yawValue",
                type: "text"
            }, yc);
            var yd = dojo.create("div", {
                id: "yawSliderDecrement"
            }, yc);
            var yl = dojo.create("div", {
                id: "yawLabel",
                innerHTML: "Yaw: "
            }, yc);
            
            /* Horizontal slider for controlling Roll. */
            var xc = dojo.create("div", {
                id: "rollControl"
            }, ctrl);
            var xsc = dojo.create("div", {
                id: "rollSliderControl"
            }, xc);
            var xs = dojo.create("div", {
                id: "rollSlider"
            }, xsc);
            var xi = dojo.create("div", {
                id: "rollSliderIncrement"
            }, xc);
            var xv = dojo.create("input", {
                id: "rollValue",
                type: "text"
            }, xc);
            var xd = dojo.create("div", {
                id: "rollSliderDecrement"
            }, xc);
            var xl = dojo.create("div", {
                id: "rollLabel",
                innerHTML: "Roll: "
            }, xc);
        }

        var reset = dojo.create("input", {
            id: "resetControls",
            type: "button",
            value: "Reset values"
        }, ctrl);
        this.connections.push(dojo.connect(reset, "onclick", function(){
			if (ngembryo.orientation.old_oid != -1)
				ngembryo.orientation.select(ngembryo.orientation.old_oid);
			else {
        	/* Get default value. */
        	if (controls.zoom) {
        		ngembryo.zoomSlider.set(ngembryo.controlManager.getZoomValue());
        	}
        	if (controls.sec) {
        		ngembryo.yawSlider.set(ngembryo.controlManager.getYawValue());
        		ngembryo.pitchSlider.set(ngembryo.controlManager.getPitchValue());
        		ngembryo.rollSlider.set(ngembryo.controlManager.getRollValue());
        		ngembryo.dstSlider.set(ngembryo.controlManager.getDistanceValue());
        	}
			}
        }));

        /* Toggle view of controls panel. */
        var tcv = dojo.create("div", {
            id: "dragControls",
            innerHTML: "Controls panel: drag here to move the panel"
        }, ctrl);
        var tcvDrag = ctrl.makeDraggable({ handle: tcv, container: dijit.byId("content").domNode });
    },
    
    setZoomValue: function(value){
        if ($defined(woolz) && $defined(woolz.model) && $defined(value)) {
            var l = ngembryo.zoomSlider.options.range[0];
            var h = ngembryo.zoomSlider.options.range[1];
            var min = Math.pow(2, -1);
            var max = Math.pow(2, 2);
            if (value < min)
            	value = min;
            if (value > max)
            	value = max;            
            var n = Math.log(value) / Math.LN2;
            ngembryo.zoomSlider.set(n);
            return Math.pow(2, n);
        }
        else {
            return 1;
        }
    },
    setDistanceValue: function(value){
        if ($defined(woolz) && $defined(woolz.model) && $defined(value)) {
            var l = ngembryo.dstSlider.options.range[0];
            var h = ngembryo.dstSlider.options.range[1];
            var n = value;
            if (n < l) 
                n = l;
            if (n > h) 
                n = h;
            ngembryo.dstSlider.set(n);
            return n;
        }
        else {
            return 122;
        }
    },
    setYawValue: function(value){
        if ($defined(woolz) && $defined(woolz.model) && $defined(value)) {
            var l = ngembryo.yawSlider.options.range[0];
            var h = ngembryo.yawSlider.options.range[1];
            var n = value;
            if (n < l) 
                n = l;
            if (n > h) 
                n = h;
            ngembryo.yawSlider.set(n);
            return n;
        }
        else {
            return 0;
        }
    },
    setPitchValue: function(value){
        if ($defined(woolz) && $defined(woolz.model) && $defined(value)) {
            var l = ngembryo.pitchSlider.options.range[0];
            var h = ngembryo.pitchSlider.options.range[1];
            var n = value;
            if (n < l) 
                n = l;
            if (n > h) 
                n = h;
            ngembryo.pitchSlider.set(n);
            return n;
        }
        else {
            return 0;
        }
    },
    setRollValue: function(value){
        if ($defined(woolz) && $defined(woolz.model) && $defined(value)) {
            var l = ngembryo.rollSlider.options.range[0];
            var h = ngembryo.rollSlider.options.range[1];
            var n = value;
            if (n < l) 
                n = l;
            if (n > h) 
                n = h;
            ngembryo.rollSlider.set(n);
            return n;
        }
        else {
            return 0;
        }
    },

    getZoomValue: function(){
        if ($defined(woolz) && $defined(woolz.model)) {
        	return 0;
        }
        else {
            return 1;
        }
    },
    getDistanceValue: function(){
        if ($defined(woolz) && $defined(woolz.model)) {
        	var t = ngembryo.dstSlider.options.range[0];
        	t += ngembryo.dstSlider.options.range[1];
            return Math.round(t / 2);
        }
        else {
            return 122;
        }
    },
    getYawValue: function(){
        if ($defined(woolz) && $defined(woolz.model)) {
            return ngembryo.yawSlider.options.range[0];
        }
        else {
            return 0;
        }
    },
    getPitchValue: function(){
        if ($defined(woolz) && $defined(woolz.model)) {
            return ngembryo.pitchSlider.options.range[0];
        }
        else {
            return 0;
        }
    },
    getRollValue: function(value){
        if ($defined(woolz) && $defined(woolz.model)) {
            return ngembryo.rollSlider.options.range[0];
        }
        else {
            return 0;
        }
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
            this.connections.push(dojo.connect(dojo.byId("zoomValue"), "onchange", function(){
                this.value = ngembryo.controlManager.setZoomValue(this.value);
            }));
            this.connections.push(dojo.connect(dojo.byId("zoomSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.zoomSlider.step - 1;
                    var l = ngembryo.zoomSlider.options.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.zoomSlider.set(n);
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("zoomSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.zoomSlider.step + 1;
                    var h = ngembryo.zoomSlider.options.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.zoomSlider.set(n);
                }
            }));
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
            this.connections.push(dojo.connect(dojo.byId("dstValue"), "onchange", function(){
                this.value = ngembryo.controlManager.setDistanceValue(this.value);
            }));
            this.connections.push(dojo.connect(dojo.byId("dstSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.dstSlider.step - 1;
                    var l = ngembryo.dstSlider.options.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.dstSlider.set(n);
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("dstSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.dstSlider.step + 1;
                    var h = ngembryo.dstSlider.options.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.dstSlider.set(n);
                }
            }));
        }
        if (this.controls.navigator) {
            this.connections.push(dojo.connect(dojo.byId("navigatorLeft"), "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.xfit) {
                    var x = 0.5;
                    var t = woolz.locator.zone.offsetLeft - 15;
                    if (t < 0) 
                        t = 0;
                    x = (t + woolz.locator.zonewidth / 2) /
                    woolz.locator.navwidth;
                    woolz.locator.zone.style.left = t + "px";
                    woolz.model.setVals(['x'], [x], false, 'locator');
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("navigatorRight"), "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.xfit) {
                    var x = 0.5;
                    var t = woolz.locator.zone.offsetLeft + 15;
                    var j = woolz.locator.navwidth -
                    woolz.locator.zonewidth;
                    if (t > j) 
                        t = j;
                    x = (t + woolz.locator.zonewidth / 2) /
                    woolz.locator.navwidth;
                    woolz.locator.zone.style.left = t + "px";
                    woolz.model.setVals(['x'], [x], false, 'locator');
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("navigatorUp"), "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.yfit) {
                    var y = 0.5;
                    var t = woolz.locator.zone.offsetTop - 15;
                    if (t < 0) 
                        t = 0;
                    y = (t + woolz.locator.zoneheight / 2) /
                    woolz.locator.navheight;
                    woolz.locator.zone.style.top = t + "px";
                    woolz.model.setVals(['y'], [y], false, 'locator');
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("navigatorDown"), "onclick", function(){
                if ($defined(woolz.model) && !woolz.model.yfit) {
                    var y = 0.5;
                    var t = woolz.locator.zone.offsetTop + 15;
                    var j = woolz.locator.navheight -
                    woolz.locator.zoneheight;
                    if (t > j) 
                        t = j;
                    y = (t + woolz.locator.zoneheight / 2) /
                    woolz.locator.navheight;
                    woolz.locator.zone.style.top = t + "px";
                    woolz.model.setVals(['y'], [y], false, 'locator');
                }
            }));
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
            
            this.connections.push(dojo.connect(dojo.byId("pitchValue"), "onchange", function(){
                this.value = ngembryo.controlManager.setPitchValue(this.value);
            }));
            this.connections.push(dojo.connect(dojo.byId("pitchSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.pitchSlider.step - 1;
                    var l = ngembryo.pitchSlider.options.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.pitchSlider.set(n);
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("pitchSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.pitchSlider.step + 1;
                    var h = ngembryo.pitchSlider.options.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.pitchSlider.set(n);
                }
            }));
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
            this.connections.push(dojo.connect(dojo.byId("yawValue"), "onchange", function(){
                this.value = ngembryo.controlManager.setYawValue(this.value);
            }));
            this.connections.push(dojo.connect(dojo.byId("yawSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.yawSlider.step - 1;
                    var l = ngembryo.yawSlider.options.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.yawSlider.set(n);
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("yawSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.yawSlider.step + 1;
                    var h = ngembryo.yawSlider.options.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.yawSlider.set(n);
                }
            }));
            ngembryo.rollSlider = new Slider($('rollSliderControl'), $('rollSlider'), {
                range: [0, 359],
                snaps: true,
                steps: 360,
                wheel: 1,
                onChange: function(step){
                    $('rollValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['rol'], [step], false, 'sectionplane');
                    }
                },
                onComplete: function(step){
                    $('rollValue').set('value', step);
                    if (ngembryo.setByUser) {
                        if ($defined(woolz) && $defined(woolz.model)) 
                            woolz.model.setVals(['rol'], [step], true, 'sectionplane');
                    }
                }
            }).set(0);
            this.connections.push(dojo.connect(dojo.byId("rollValue"), "onchange", function(){
                this.value = ngembryo.controlManager.setRollValue(this.value);
            }));
            this.connections.push(dojo.connect(dojo.byId("rollSliderDecrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.rollSlider.step - 1;
                    var l = ngembryo.rollSlider.options.range[0];
                    if (n < l) 
                        n = l;
                    ngembryo.rollSlider.set(n);
                }
            }));
            this.connections.push(dojo.connect(dojo.byId("rollSliderIncrement"), "onclick", function(){
                if ($defined(woolz) && $defined(woolz.model)) {
                    var n = ngembryo.rollSlider.step + 1;
                    var h = ngembryo.rollSlider.options.range[1];
                    if (n > h) 
                        n = h;
                    ngembryo.rollSlider.set(n);
                }
            }));
        }
        
        /* Display the controls panel. */
        if (ngembryo.engine.isControlsActive()) {
            ngembryo.engine.activateControls();
        	ngembryo.engine.showControls();
        }
        else {
            ngembryo.engine.hideControls();
        	ngembryo.engine.deactivateControls();
        }
    },
    
    destroy: function(){
        var ctrl = dojo.byId("controls");
        ngembryo.controlReady = false;
        for (var i = 0; i < this.connections.length; i++) {
            dojo.disconnect(this.connections[i]);
        }
        destroyChildSubtree(ctrl);
        ngembryo.zoomSlider = null;
        ngembryo.dstSlider = null;
        ngembryo.yawSlider = null;
        ngembryo.rollSlider = null;
        ngembryo.pitchSlider = null;
    }
});
