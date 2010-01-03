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
 * @classDescription This encapsulates a label renderer.
 *
 * A label renderer is used to uniformly display annotation label
 * when the mouse pointer hovers over markers and regions. By using
 * a default label renderer, we can devise different approaches to
 * displaying the labels, depending on the browser setting etc..
 */
var LabelRenderer = new Class({
    /**
     * Initialises the label renderer with the specified setting (Dojo settings).
     *
     * @param {Object} family Font-family; e.g., Arial, Verdana etc..
     * @param {Object} style Font-style; e.g., regular, slanted etc..
     * @param {Object} weight Font-weight; e.g., bold, medium etc..
     * @param {Object} size Font-size; e.g., 12pt, 10pt etc..
     * @param {Object} ff Font-fill color (in RGB); e.g., #FF0000 for red fill.
     * @param {Object} fs Font-stroke color (in RGB); e.g., #000000 for black outline.
     * @param {Object} bf Fill color (in RGB) for the box enclosing label text.
     * @param {Object} bs Stoke color (in RGB) for the box enclosing label text.
     * @param {Object} r Radius (in pixels) if label enclosing box should have rounded corners.
     * @param {Object} p Space (in pixels) between the label text and the enclosing box.
     * @param {Object} ox x-displacement of the label box from the marker (in pixels).
     * @param {Object} oy y-displacement of the label box from the marker (in pixels).
     * @param {Boolean} lline If true, a line is drawn connecting lable to annotation.
     */
    initialize: function(family, style, weight, size, ff, fs, bf, bs, r, p, ox, oy, lline){
        this.family = family;
        this.style = style;
        this.weight = weight;
        this.size = size;
        this.fontFill = ff;
        this.fontStroke = fs;
        this.boxFill = bf;
        this.boxStroke = bs;
        this.corner = r;
        this.padding = p;
        this.height = 20; // TODO: Text box height. At the moment, we cannot determine this value using Dojo.
        this.offsetX = ox;
        this.offsetY = oy;
        this.labelLine = lline;
    },
    
    /**
     * Renders the label using label data.
     *
     * @param {Object} group Markers are rendered as groups of Dojo shapes.
     * @param {String} Label text to be displayed.
     * @param {String} Description of the annotation.
     * @param {Integer} mx x-coordinate of the marker.
     * @param {Integer} my y-coordinate of the marker.
     * @param {Integer} width Half of window width.
     * @param {Integer} height Half of window height.
     */
    render: function(group, label, description, mx, my, width, height){
        var quadrant;
        if (mx > width) {
            if (my > height) {
                quadrant = 4;
            }
            else {
                quadrant = 1;
            }
        }
        else {
            if (my > height) {
                quadrant = 3;
            }
            else {
                quadrant = 2;
            }
        }
        var _x, _y;
        switch (quadrant) {
            case 1:
                _x = mx - this.offsetX;
                _y = my + this.offsetY;
                break;
            case 2:
                _x = mx + this.offsetX;
                _y = my + this.offsetY;
                break;
            case 3:
                _x = mx + this.offsetX;
                _y = my - this.offsetY;
                break;
            case 4:
                _x = mx - this.offsetX;
                _y = my - this.offsetY;
                break;
        }
        var markerLabel = group.createText({
            x: _x,
            y: _y,
            text: label
        });
        markerLabel.setFont({
            family: this.family,
            size: this.size,
            style: this.style,
            weight: this.weight
        });
        if ($defined(this.fontFill)) 
            markerLabel.setFill(this.fontFill);
        if ($defined(this.fontStroke)) 
            markerLabel.setStroke(this.fontStroke);
       
	   /* Lets leave this out for the moment.
	     
	     
        var markerDescription = group.createText({
            x: _x,
            y: _y + 15, // TODO: Offset should be set elsewhere.
            text: description
        });
        markerDescription.setFont({
            family: this.family,
            size: this.size,
            style: this.style,
            weight: "medium"
        });
        if ($defined(this.fontFill)) 
            markerDescription.setFill(this.fontFill);
        */
		
        var markerLabelBox = group.createRect({
            x: _x - this.padding,
            y: _y - this.height,
            width: markerLabel.getTextWidth() + 2 * this.padding,
            height: this.height + this.padding,
            r: this.corner
        });
        if ($defined(this.boxFill)) 
            markerLabelBox.setFill(this.boxFill);
        if ($defined(this.boxStroke)) 
            markerLabelBox.setStroke(this.boxStroke);
        /* This polyline joins the marker to the label. */
        if (this.labelLine) {
            var markerLabelConnector = group.createPolyline({
                points: [{
                    x: mx,
                    y: my
                }, {
                    x: _x,
                    y: _y
                }]
            });
            markerLabelConnector.setStroke({
                color: "blue",
                width: 1,
                style: "solid"
            });
        }
        if (quadrant == 1 || quadrant == 4) {
            var m = dojox.gfx.matrix;
            markerLabel.applyTransform(m.translate(-markerLabel.getTextWidth(), 0));
            markerLabelBox.applyTransform(m.translate(-markerLabel.getTextWidth(), 0));
        }
        markerLabelBox.moveToFront();
        markerLabel.moveToFront();
    }
});
