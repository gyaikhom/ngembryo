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
 * @classDescription This class encapsulates the cooking manager.
 *
 * The cookie manager manages the storage, retrieval, setting and unsetting
 * of annotation engine state. My storing the engine state, we can provide a
 * personalised portal, catering to the needs of the user.
 */
var CookieManager = new Class({
    /**
     * Retrieves ngembryo cookies stored at the client browser and initialises the
     * ngembryo engine accordingly.
     */
    initialize: function(){
        dojo.cookie("cookieEnabled", true, 0)
        if (!$defined(dojo.cookie("cookieEnabled"))) {
            this.enabled = false;
            return;
        }
        else {
            this.enabled = true;
        }
        this.expires = 30; // Cookies expire after 30 days.
    },
    
    /**
     * Sets the value of the named cookie entity to true.
     *
     * @param {Object} name
     * @param {Object} value
     */
    set: function(name, value){
        if (this.enabled) {
            dojo.cookie(name, value, this.expires);
        }
    },
    
    /**
     * Gets the stored value of the named cookied. If no value was found,
     * store the default value.
     *
     * @param {Object} name
     * @param {Object} defaultValue
     */
    get: function(name, defaultValue){
        if (this.enabled) {
            var temp = dojo.cookie(name);
            if (!$defined(temp)) {
                temp = defaultValue;
                this.set(name, temp);
            }
            else {
                if (temp == 'true') 
                    temp = true;
                else 
                    temp = false;
            }
            return temp;
        }
    },
    
    /**
     * Clears all of the ngembryo cookies stored at the client browser.
     */
    clear: function(){
        if (this.enabled) {
            engine.m2DV = dojo.cookie("m2dv", null, {
                expires: -1
            });
            engine.m3DV = dojo.cookie("m3dv", null, {
                expires: -1
            });
            engine.r2DV = dojo.cookie("r2dv", null, {
                expires: -1
            });
        }
    }
});
