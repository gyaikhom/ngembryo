/**
 * @classDescription This class encapsulates a marker icon.
 *
 * @author gyaikhom
 * @version 0.0.1
 */
var Icon = Class({
    /**
     * This function creates a new icon object that will be used to
     * display 2D and 3D markers. The icon object uses an image source
     * and the size of the image (height, and width) is used when placing
     * the icon to represent a marker. The orientation of the icon determines
     * the manner in which the adjustment of the marker coordinates.
     * (@see create2Dmarke, create3Dmarker)
     *
     * @param {String} src Image file source of the icon image.
     * @param {Integer} width Image width.
     * @param {Integer} height Image height.
     * @param {String} orientation Orientation of the image.
     * @return {Object} icon The new icon object.
     */
    initialize: function(src, width, height, orientation){
        if (dojo.isString(src)) {
            if ($type(width) == "number") {
                if ($type(height) == "number") {
                    if (dojo.isString(orientation)) {
                        this.src = src;
                        this.width = width;
                        this.height = height;
                        
                        /* If the orientation is undefined, or is not one of the
                         valid orentations, assume icon pointing downwards. */
                        if ($type(orientation) == "string") {
                            if (orientation === 'lt' ||
                            orientation === 'tt' ||
                            orientation === 'rt' ||
                            orientation === 'll' ||
                            orientation === 'cc' ||
                            orientation === 'rr' ||
                            orientation === 'ld' ||
                            orientation === 'dd' ||
                            orientation === 'rd') {
                                this.orientation = orientation;
                            }
                            else {
                                console.warn("Icon orientation invalid. Using default orientation.");
                                this.orientation = 'dd';
                            }
                        }
                        else {
                            console.warn("Icon orientation undefined. Using default orientation.");
                            this.orientation = 'dd';
                        }
                    }
                }
                else {
                    console.error("Image height undefined.");
                }
            }
            else {
                console.error("Image width undefined.");
            }
        }
        else {
            console.error("Image source file undefined.");
        }
    },
    
	/**
	 * This function makes adjustment to the marker coordinates so that
	 * the icons are oriented correctly, with respect to the orientation of 
	 * the icon image.
	 * 
	 * @param {Integer} x x-coordinate of the marker.
	 * @param {Integer} y y-coordinate of the marker.
	 * @return {Object} This contains the adjusted coordinates.
	 */
    adjustCoordinates: function(x, y){
        var nc = new Object();
        /* Orientations and their meaning (relative to the surface).
         l - left, r - right
         t - top, b - bottom, c - centre
         
         ------------------
         | lt     tt     rt |
         |                  |
         |                  |
         | ll     cc     rr |
         |                  |
         |                  |
         | ld     dd     rd |
         ------------------
         E.g. an arrow which points to the right '->' will have
         orientation 'rr'; whereas, an arrow which points left will have
         orientation 'll'.
         Note that Dojo createImage positions an image by placing the
         top-left corner of the image on the supplied point.
         */
        switch (this.orientation) {
            case 'lt':
                nc.x = x;
                nc.y = y;
                break;
            case 'tt':
                nc.x = x - Math.round(this.width / 2);
                nc.y = y;
                break;
            case 'rt':
                nc.x = x - this.width;
                nc.y = y;
                break;
            case 'll':
                nc.x = x;
                nc.y = y - Math.round(this.height / 2);
                break;
            case 'cc':
                nc.x = x - Math.round(this.width / 2);
                nc.y = y - Math.round(this.height / 2);
                break;
            case 'rr':
                nc.x = x - this.width;
                nc.y = y - Math.round(this.height / 2);
                break;
            case 'ld':
                nc.x = x;
                nc.y = y - this.height;
                break;
            case 'dd':
                nc.x = x - Math.round(this.width / 2);
                nc.y = y - this.height;
                break;
            case 'rd':
                nc.x = x - this.width;
                nc.y = y - this.height;
                break;
            default:
                nc.x = x;
                nc.y = y;
        }
        return nc;
    }
});
