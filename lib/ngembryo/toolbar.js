/**
 * Encapsulates the web application toolbar.
 */
var Toolbar = new Class({
    __sd: function(t) {
        var m = ngembryo.models.item[t.index];
        dojo.xhrGet({
            url: "getOrientationLayerAnnotation.php?mid=" + m.id,
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds. */
            load: function(r, ioArgs) {
                if ($defined(r)) {
                    if (r.e === 0) {
                        var info = m.title + " - markers: " + r.d.m
                            + ", regions: " + r.d.r + ", layers: " + r.d.l
                            + ", orientations: " + r.d.o;
                        dojo.attr(t, {
                            label: info
                        });
                    } else {
                        ngembryo.content.feedback.show("warn", r.m);
                    }
                } else {
                    ngembryo.content.feedback.show("error",
                        "Server did not respond");
                }
            },
            error: function(response, ioArgs) {
                ngembryo.content.feedback.show("error", "HTTP status code ("
                    + ioArgs.xhr.status
                    + ") : Failure to process server response");
            }
        });
    },
    /**
     * Initialises the toolbar.
     * 
     * @param {Object} app Application to attach the toolbar to.
     * @param {Object} engine Annotation Engine.
     * @param {Object} models list of models.
     * @param {String} username Name of the user.
     */
    initialize: function(app, engine, models, username) {
        var t = new Array();

        /* Toolbar is displayed on the top of the web-application. */
        var toolbar = new dijit.Toolbar({
            region: "top",
            style: "height:25px;"
        });
        app.addChild(toolbar);

        /* A drop-down button is used to select an embryo model. */
        var menu = new dijit.Menu({
            id: "toolbar-menu",
            style: "display: none;"
        });
        for (var i = 0; i < models.item.length; i++) {
            var temp = new dijit.MenuItem({
                id: "modelMenuItem" + i,
                index: i,
                label: models.item[i].title,
                onClick: function() {
                    var id = ngembryo.models.item[this.index].id;
                    models.createEmbryoModel(id);
                },
                onFocus: function() {
                    ngembryo.toolbar.__sd(this);
                },
                onBlur: function() {
                    dojo.attr(this, {
                        label: ngembryo.models.item[this.index].title
                    });
                }
            });
            menu.addChild(temp);
        }

        /* Displays the selection menu on the toolbar. */
        var selectEmbryo = new dijit.form.DropDownButton({
            label: "Embryo",
            name: "selectEmbryo",
            dropDown: menu,
            id: "selectEmbryo",
            style: "float:left;"
        });
        toolbar.addChild(selectEmbryo);
        t.push("selectEmbryo");

        /*
         * Toggle buttons are used to control display or hiding of annotations.
         */
        var toggleMarkers = new dijit.form.ToggleButton({
            id: "toggleMarkers",
            label: "Markers",
            checked: engine.isMarkerVisible(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function() {
                ngembryo.engine.toggleMarkerVisibility();
            }
        });
        toolbar.addChild(toggleMarkers);
        t.push("toggleMarkers");

        var toggleRegions = new dijit.form.ToggleButton({
            id: "toggleRegions",
            label: "Regions",
            checked: engine.isRegionVisible(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function() {
                ngembryo.engine.toggleRegionVisibility();
            }
        });
        toolbar.addChild(toggleRegions);
        t.push("toggleRegions");

        var toggleControls = new dijit.form.ToggleButton({
            id: "toggleControls",
            label: "Controls",
            checked: engine.isControlsActive(),
            iconClass: "dijitCheckBoxIcon",
            style: "float:left;",
            onClick: function() {
                var h = dojo.style('content', 'height');
                var t = dojo.style('toggleControls', 'height') + 2;
                if (ngembryo.engine.isControlsActive()) {
                    ngembryo.engine.hideControls();
                    ngembryo.engine.deactivateControls();
                } else {
                    ngembryo.engine.activateControls();
                    ngembryo.engine.showControls();
                }
            }
        });
        toolbar.addChild(toggleControls);
        t.push("toggleControls");

        var createMarker = new dijit.form.ToggleButton({
            id: "createMarker",
            label: "marker",
            showLabel: "true",
            iconClass: "addMarker",
            style: "float:left;",
            onClick: function() {
                if (this.attr('checked')) {
                    var t = ngembryo.engine
                        .showCreateCanvas(ngembryo.engine.ccte.m);
                    if (!t) {
                        this.attr('checked', false);
                    }
                } else {
                    ngembryo.engine.hideCreateCanvas();
                }
            }
        });
        toolbar.addChild(createMarker);
        t.push("createMarker");

        var createRegion = new dijit.form.ToggleButton({
            id: "createRegion",
            label: "region",
            showLabel: "true",
            iconClass: "addRegion",
            style: "float:left;",
            onClick: function() {
                if (this.attr('checked')) {
                    var t = ngembryo.engine
                        .showCreateCanvas(ngembryo.engine.ccte.r);
                    if (!t) {
                        this.attr('checked', false);
                    }
                } else {
                    ngembryo.engine.hideCreateCanvas();
                }
            }
        });
        toolbar.addChild(createRegion);
        t.push("createRegion");

        var takeMeasurement = new dijit.form.ToggleButton({
            id: "takeMeasurement",
            label: "Measure",
            showLabel: "true",
            iconClass: "measure",
            style: "float:left;",
            onClick: function() {
                if (this.attr('checked')) {
                    var t = ngembryo.engine
                        .showCreateCanvas(ngembryo.engine.ccte.s);
                    if (!t) {
                        this.attr('checked', false);
                    }
                } else {
                    ngembryo.engine.hideCreateCanvas();
                }
            }
        });
        toolbar.addChild(takeMeasurement);
        t.push("takeMeasurement");

        /* A drop-down orientation menu. */
        var orientationMenu = new dijit.Menu({
            style: "display: none;"
        });
        var selectOrientation = new dijit.MenuItem({
            id: "selectOrientationMenuItem",
            index: 1,
            label: "Select",
            onClick: function() {
                ngembryo.orientation.display();
            }
        });
        orientationMenu.addChild(selectOrientation);
        var createOrientation = new dijit.MenuItem({
            id: "createOrientationMenuItem",
            index: 2,
            label: "Create",
            onClick: function() {
                ngembryo.orientation.create(false);
            }
        });
        orientationMenu.addChild(createOrientation);
        var orientationDropDown = new dijit.form.DropDownButton({
            label: "Orientation",
            name: "orientationDropDown",
            dropDown: orientationMenu,
            id: "orientationDropDown",
            style: "float:left;"
        });
        toolbar.addChild(orientationDropDown);
        t.push("orientationDropDown");

        /* A drop-down layer menu. */
        var layerMenu = new dijit.Menu({
            style: "display: none;"
        });
        var selectLayer = new dijit.MenuItem({
            id: "selectLayerMenuItem",
            index: 1,
            label: "Select",
            onClick: function() {
                ngembryo.layer.display();
            }
        });
        layerMenu.addChild(selectLayer);
        var createLayer = new dijit.MenuItem({
            id: "createLayerMenuItem",
            index: 2,
            label: "Create",
            onClick: function() {
                ngembryo.layer.create(false);
            }
        });
        layerMenu.addChild(createLayer);
        var layerDropDown = new dijit.form.DropDownButton({
            label: "Layer",
            name: "layerDropDown",
            dropDown: layerMenu,
            id: "layerDropDown",
            style: "float:left;"
        });
        toolbar.addChild(layerDropDown);
        t.push("layerDropDown");

        /* A drop-down resource menu. */
        var resourceMenu = new dijit.Menu({
            style: "display: none;"
        });
        var displayResource = new dijit.MenuItem({
            id: "displayResourceMenuItem",
            index: 1,
            label: "Display",
            onClick: function() {
                ngembryo.resource.list();
            }
        });
        resourceMenu.addChild(displayResource);
        var createResource = new dijit.MenuItem({
            id: "createResourceMenuItem",
            index: 2,
            label: "Create",
            onClick: function() {
                ngembryo.resource.create(false);
            }
        });
        resourceMenu.addChild(createResource);
        var resourceDropDown = new dijit.form.DropDownButton({
            label: "Resource",
            name: "resourceDropDown",
            dropDown: resourceMenu,
            id: "resourceDropDown",
            style: "float:left;"
        });
        toolbar.addChild(resourceDropDown);
        t.push("resourceDropDown");

        /* A drop-down user menu. */
        var userMenu = new dijit.Menu({
            style: "display: none;"
        });
        var logout = new dijit.MenuItem({
            id: "logoutMenuItem",
            index: 1,
            label: "Logout",
            onClick: function() {
                window.open("logout.php", "_self");
            }
        });
        userMenu.addChild(logout);
        var changeDetails = new dijit.MenuItem({
            id: "changeDetailsMenuItem",
            index: 2,
            label: "Change details",
            onClick: function() {
                ngembryo.changeUserDetails();
            }
        });
        userMenu.addChild(changeDetails);
        var userDropDown = new dijit.form.DropDownButton({
            id: "userDropDown",
            label: username,
            showLabel: "true",
            iconClass: "logout",
            name: "userDropDown",
            dropDown: userMenu,
            style: "float:right;"
        });
        toolbar.addChild(userDropDown);
        t.push("userDropDown");
        var aboutButton = new dijit.form.Button({
            id: "about",
            label: "About",
            showLabel: "true",
            iconClass: "about",
            style: "float:right;",
            onClick: function() {
                ngembryo.dialogManager.showAbout();
            }
        });
        toolbar.addChild(aboutButton);
        t.push("about");
        var helpButton = new dijit.form.Button({
            id: "help",
            label: "Help",
            showLabel: "true",
            iconClass: "help",
            style: "float:right;",
            onClick: function() {
                ngembryo.dialogManager.showHelp();
            }
        });
        toolbar.addChild(helpButton);
        t.push("help");

        var search = new dijit.form.Button({
            id: "search",
            label: "Search",
            showLabel: "true",
            iconClass: "search",
            style: "float:right;",
            onClick: function() {
                ngembryo.engine.search();
            }
        });
        toolbar.addChild(search);
        t.push("search");

        this.tb = t;
        this.toolbar = toolbar;
        this.toggleToolbarActionItems(false);
    },
    /**
     * Destroys the toolbar.
     */
    destroy: function() {
        if ($defined(this.tb) && $defined(this.toolbar)) {
            var items = this.tb;
            var t = this.toolbar;
            for (var i = 0; i < items.length; i++) {
                var x = dijit.byId(items[i]);
                t.removeChild(x);
                x.destroyRecursive();
                console.info(items[i]);
            }
        }
    },
    /**
     * Display or Hide toolbar items.
     * 
     * @param {Boolean} flag True if the toolbar items should be displayed.
     */
    toggleToolbarActionItems: function(flag) {
        if ($defined(this.tb) && $defined(this.toolbar)) {
            for (var i = 0; i < this.tb.length; i++) {
                if (this.tb[i] !== "selectEmbryo" &&
                    this.tb[i] !== "userDropDown" &&
                    this.tb[i] !== "help" &&
                    this.tb[i] !== "about" &&
                    this.tb[i] !== "search") {
                    dojo.style(dijit.byId(this.tb[i]).domNode, 'display',
                        flag ? 'block' : 'none');
                }
            }
        }
    },
    /**
     * Disables all of the toolbar items except for the supplied.
     * 
     * @param {Object} except Exception items.
     */
    disable: function(except) {
        for (var i = 0; i < this.tb.length; i++) {
            if (this.tb[i] !== except) {
                dijit.byId(this.tb[i]).attr({
                    disabled: true
                });
            }
        }
    },
    /**
     * Enables all of the toolbar items except for the supplied.
     * 
     * @param {Object} except Exception items.
     */
    enable: function(except) {
        for (var i = 0; i < this.tb.length; i++) {
            if (this.tb[i] !== except) {
                dijit.byId(this.tb[i]).attr({
                    disabled: false
                });
            }
        }
    }
});
