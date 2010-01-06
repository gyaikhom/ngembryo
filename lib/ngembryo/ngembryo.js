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
 * @classDescription This class encapsulates the NGEbmryo web application.
 *
 * This initialises the application.
 */
var NGEmbryo = new Class({
    /**
     * @classDescription Initialises the ngembryo portal.
     */
    initialize: function(){
        // Check integrity of the annotation server.
        faulty = false;
        dojo.xhrGet({
            url: "checkIntegrity.php",
            handleAs: "json",
            timeout: 5000, // Time in milliseconds.
            sync: true,
            load: function(data){
                if (data.success == false) {
                    faulty = true;
                    console.warn(data.message);
                    
                    d = new dijit.Dialog({
                        id: "errorDialog",
                        title: "Failed to initialise the annotation engine",
                        style: "height: 100px; width: 400px;",
                        content: "<div align='left' style='color: #ff0000; height: 450px; overflow: auto;'>" +
                        data.message +
                        "<p>Contact administrator at: </p></div>"
                    });
                    dojo.body().appendChild(d.domNode);
                    d.startup();
                    d.show();
                }
                else {
                    console.info(data.message);
                }
            },
            error: function(error){
                console.info(error);
            }
        });
        
        if (faulty) {
            this.faulty = true;
            return null;
        }
        
        // Initialise annotation server.
        // this.viewport = dijit.getViewport();
        
        // Initialise several component of the application.
        this.engine = new AnnotationEngine("targetframe");
        this.dialogManager = new DialogManager();
        
        // Root container for the web-application.
        var app = new dijit.layout.BorderContainer({
            design: "headline",
            gutters: "false",
            style: "height: 100%; width: 100%;"
        });
        this.toolbar = new Toolbar(app, this.engine);
        
        dojo.body().appendChild(app.domNode);
        app.startup();
    },
    
    /**
     * Starts the application.
     */
    start: function(){
        this.engine.start();
        this.engine.refresh();
    }
});
