/**
 * Encapsulates embryo models.
 */
var Models = new Class({
    initialize: function() {
        dojo.xhrGet({
            url: "getModels.php",
            handleAs: "json",
            sync: true,
            timeout: 5000, /* Time in milliseconds. */
            load: function(response, ioArgs) {
                if ($defined(response)) {
                    if (response.success) {
                        this.item = response.m;
                        if (!$defined(data)) {
                            ngembryo.content.feedback.show("info",
                                response.message);
                        }
                    } else {
                        ngembryo.content.feedback
                            .show("warn", response.message);
                    }
                } else {
                    ngembryo.content.feedback.show("error",
                        "Server did not respond");
                }
            }.bind(this),
            error: function(response, ioArgs) {
                ngembryo.content.feedback.show("error", "HTTP status code ("
                    + ioArgs.xhr.status + ") : Failure to "
                    + "process server response");
            }
        });
    },
    destroy: function() {

    },
    createEmbryoModel: function(id) {
        var index = -1;
        for (var i = 0; i < this.item.length; i++) {
            if (this.item[i].id === id)
                index = i;
        }
        if (index === -1)
            return;

        if ($defined(ngembryo.toolbar)) {
            ngembryo.toolbar.toggleToolbarActionItems(false);
        }
        if ($defined(woolz)) {
            woolz.destroy();
            woolz = null;
        }
        if ($defined(ngembryo.orientation)) {
            ngembryo.orientation.destroy();
            ngembryo.orientation = null;
        }
        if ($defined(ngembryo.layer)) {
            ngembryo.layer.destroy();
            ngembryo.layer = null;
        }
        if ($defined(ngembryo.controlManager)) {
            ngembryo.controlManager.destroy();
            ngembryo.controlManager = null;
        }
        if ($defined(ngembryo.resize)) {
            dojo.disconnect(ngembryo.resize);
        }
        ngembryo.controlManager = new ControlManager({
            zoom: true,
            dst: true,
            navigator: true,
            roi: true,
            sec: true
        });
        this.item[index].source = "woolz";
        woolz = new WlzIIPViewer(this.item[index]);
        ngembryo.mid = this.item[index].id;
        ngembryo.orientation = new Orientation();
        ngembryo.layer = new Layer();
        if ($defined(ngembryo.toolbar)) {
            ngembryo.toolbar.toggleToolbarActionItems(true);
        }
        ngembryo.controlManager.startup();
        ngembryo.resize = dojo.connect(window, "onresize", function() {
            woolz.model.setViewportSize(window.getWidth(), window.getHeight());
            ngembryo.refresh();
        });
        dojo.byId("control-model-value").innerHTML = this.item[index].title;
        ngembryo.refresh();
    }
});
