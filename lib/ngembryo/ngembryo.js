/**
 * Encapsulates the NGEbmryo web application.
 */
var NGEmbryo = new Class({
    /**
     * Initialises the ngembryo portal.
     */
    initialize: function(username) {
        /*
         * This is for controlling event handling. setByUser is set to true if
         * the event was raised by user intervention. otherwise, it is set to
         * false. This resolves recursive event handling where event trigger
         * each other circularly.
         */
        this.setByUser = true;
        this.controlReady = false;
        this.username = username;

        /* Check integrity of the annotation server. */
        faulty = false;
        var checkServerStatus = function(data) {
            if (data.success === false) {
                faulty = true;
                console.warn(data.message);
                d = new dijit.Dialog({
                    id: "errorDialog",
                    title: "Failed to initialise the annotation engine",
                    style: "height: 100px; width: 400px;",
                    content: "<div align='left' style='color: #ff0000;"
                        + "height: 450px; overflow: auto;'>" + data.message
                        + "<p>Contact administrator at: </p></div>"
                });
                dojo.body().appendChild(d.domNode);
                d.startup();
                d.show();
            }
        };

        dojo.xhrGet({
            url: "checkIntegrity.php",
            handleAs: "json",
            timeout: 5000, /* Time in milliseconds. */
            sync: true,
            load: checkServerStatus,
            error: function(error) {
                console.info(error);
            }
        });

        if (faulty) {
            this.faulty = true;
            return null;
        }
        this.engine = new AnnotationEngine("annot");
        this.dialogManager = new DialogManager();
        var app = new dijit.layout.BorderContainer({
            id: "ngembryo-application",
            design: "headline",
            gutters: "false"
        });
        this.models = new Models();
        this.toolbar = new Toolbar(app, this.engine, this.models, username);
        this.content = new Content(app);
        dojo.body().appendChild(app.domNode);
        app.startup();
    },
    /**
     * Starts the application.
     */
    start: function() {
        ngembryo.resource = new Resource();
        this.engine.start();
    },
    destroy: function() {
        this.content.destroy();
        this.models.destroy();
        this.resource.destroy();
        this.toolbar.destroy();
        this.dialogManager.destroy();
        this.engine.destroy();
        var app = dojo.byId("ngembryo-application");
        if ($defined(app)) {
            dojo.body().removeChild(app.domNode);
            app.destroyRecursive(false);
        }

        /* Clean up any remaining DOM element. */
        destroyChildSubtree(dojo.body());
    },
    refresh: function() {
        this.engine.refresh();
    },
    /**
     * Checks the sanity of user supplied data.
     */
    is_sane: function(data, type) {
        var p = "";
        switch (type) {
            case 'u':
                return /^[a-zA-Z]+[a-zA-Z0-9_]{4,15}$/.test(data);
            case 'p':
                return /^.*(?=.{8,30})(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/.test(data);
            case 'e':
                return /^[^0-9][A-z0-9_]+([.][A-z0-9_]+)*[@][A-z0-9_]+([.][A-z0-9_]+)*[.][A-z]{2,4}$/.test(data);
            default:
                return false;
        }
    },
    /**
     * Check sanity of change user details.
     */
    __chk_sanity_chuser: function() {
        var frm = document.forms["chuser"];
        if (frm.npw.value === null) {
            alert('Please supply new password');
            return false;
        }
        if (!this.is_sane(frm.npw.value, 'p')) {
            alert('Please supply a valid password');
            return false;
        }
        if (frm.rnpw.value === null) {
            alert('Please re-type new password');
            return false;
        }
        if (frm.npw.value !== frm.rnpw.value) {
            alert("Supplied new password and re-typed"
                + " new password do not match!");
            return false;
        }
        if (frm.rn.value === null) {
            alert('Please supply real name.');
            return false;
        }
        if (frm.em.value === null) {
            alert('Please supply an email.');
            return false;
        }
        if (!this.is_sane(frm.em.value, 'e')) {
            alert('Please supply a valid email');
            return false;
        }
        return true;
    },
    changeUserDetails: function() {
        var cud = dijit.byId("change-user-details-dialog");
        if ($defined(cud)) {
            dojo.body().removeChild(cud.domNode);
            cud.destroyRecursive(false);
        }
        cud = new dijit.Dialog({
            id: "change-user-details-dialog",
            title: "Change user details",
            style: "width: 590px;",
            content: this.resource.__getForm("updateUserForm.php"),
            onHide: function() {
                dojo.body().removeChild(this.domNode);
                this.destroyRecursive(false);
            }
        });
        dojo.body().appendChild(cud.domNode);
        var theForm = dojo.byId("chuser");
        var handle = dojo.connect(theForm, "onsubmit", function(event) {
            /*
             * prevent the form from actually submitting.
             */
            event.preventDefault();

            /* Check sanity of the user supplied data. */
            if (!ngembryo.__chk_sanity_chuser())
                return;

            /* submit the form in the background */
            dojo.xhrPost({
                url: "updateUser.php",
                form: "chuser",
                handleAs: "json",
                load: function(response, ioArgs) {
                    if ($defined(response)) {
                        if (response.success) {
                            ngembryo.content.feedback.show("info",
                                response.message);
                        } else {
                            ngembryo.content.feedback.show("warn",
                                response.message);
                        }
                    }
                }.bind(this),
                error: function(response, ioArgs) {
                    ngembryo.content.feedback.show("error",
                        "HTTP status code (" + ioArgs.xhr.status
                        + ") : Failure to"
                        + " process server response");
                    return response;
                }
            });
            dojo.disconnect(handle);
            cud.hide();
            ngembryo.engine.refresh();
        });
        cud.startup();
        cud.show();
    }
});
