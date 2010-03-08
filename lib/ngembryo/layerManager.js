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
 * @classDescription This class manages annotation layers.
 * 
 * All of the annotations (2D and 3D markers, and 2D regions) are managed as
 * collections of annotations. These collections are defined using layers.
 * Annotations are associate with a layer, and these layers are either displayed
 * or hidden. Only layers that are visible are rendered on the Dojo surface.
 */
var LayerManager = new Class( {

	initialize : function(labelRenderer) {
		this.labelRenderer = labelRenderer;
		/*
		 * This hash stores all of the layers currently associated with the
		 * annotation surface. We use only one annotation surface, and display
		 * the visible layers by overlaying the layers over the surface canvas.
		 */
		this.annotationLayers = new Hash();
	},

	/**
	 * This function adds a new layer to the existing set of layers. The
	 * 'name'is used to identify a layer. If 'visible' is undefined or true, the
	 * new layer will be registered as visible. Otherwise, it will be registered
	 * as invisible. This only applies to initialisation, since the visibility
	 * of layers can be altered later. The annotations are the collection of
	 * items that are currently visible inside the region-of-interest marked by
	 * the surface bounding box. The annotations could be undefined if there are
	 * no items currently visible inside the region-of-interest.
	 * 
	 * @param {String}
	 *            name Unique name of the new layer (used as hash key).
	 * @param {Boolean}
	 *            visible Layer visibility (true if visible, otherwise false).
	 */
	addLayer : function(name, visible) {
		if ($defined(this.annotationLayers)) {
			var layer = new Object();
			layer.name = name;
			layer.visible = visible;
			layer.annotationList = null;
			this.annotationLayers.set(name, layer);
		}
	},

	/**
	 * This function removes a named layer from the set of layers.
	 * 
	 * @param {String}
	 *            name Unique name of the layer to be removed (hash key).
	 */
	removeLayer : function(name) {
		if ($defined(this.annotationLayers)) {
			this.annotationLayers.erase(name);
		}
	},

	/**
	 * This function removes all of the layers.
	 */
	removeAllLayers : function() {
		if ($defined(this.annotationLayers)) {
			var layers = this.annotationLayers.getKeys();
			for ( var i = 0; i < layers.length; i++)
				removeLayer(layers[i]);
		}
	},

	/**
	 * This function sets the visibility of a named layer.
	 * 
	 * @param {String}
	 *            name Unique name of the layer (hash key).
	 * @param {Boolean}
	 *            visibility Layer visibility (true if visible, otherwise
	 *            false).
	 */
	setLayerVisibility : function(name, visibility) {
		if ($defined(this.annotationLayers)) {
			if ($defined(name)) {
				var layer = this.annotationLayers.get(name);
				layer.visible = visibility;
				this.annotationLayers.set(name, layer);
			}
		}
	},

	/**
	 * This function makes all of the layers visible.
	 */
	showAllLayers : function() {
		if ($defined(this.annotationLayers)) {
			var layers = this.annotationLayers.getKeys();
			for ( var i = 0; i < layers.length; i++)
				setLayerVisibility(layers[i], true);
		}
	},

	/**
	 * This function hides all of the layers.
	 */
	hideAllLayers : function() {
		if ($defined(this.annotationLayers)) {
			var layers = this.annotationLayers.getKeys();
			for ( var i = 0; i < layers.length; i++)
				setLayerVisibility(layers[i], false);
		}
	},

	/**
	 * This function adds an annotation to the named layer.
	 * 
	 * @param {String}
	 *            name Layer to which the annotation will be attached (hash
	 *            key).
	 * @param {Annotation}
	 *            annotation The annotation to be attached.
	 */
	addAnnotationToLayer : function(name, annotation) {
		if ($defined(this.annotationLayers)) {
			var layer = this.annotationLayers.get(name);
			if ($defined(layer)) {
				/*
				 * Every layer consist of an annotation list. If this list is
				 * not defined, this means that this our annotation is the first
				 * annotation for this layer. So, create an annotation list.
				 */
				if (!$defined(layer.annotationList)) {
					layer.annotationList = new Hash();
				}

				/* Every annotation in the list must have a unique id. */
				layer.annotationList.set(annotation.id, annotation);
			} else {
				console.error("Undefined annotation layer names '" + name
						+ "'.");
			}
		} else {
			console.error("Undefined annotation layer hash.");
		}
	},

	/**
	 * This function Removes an annotation from a layer.
	 * 
	 * @param {String}
	 *            name Layer from which to remove the annotation (hash key).
	 * @param {Integer}
	 *            annotationID The unique identifier of the annotation.
	 */
	removeAnnotationFromLayer : function(name, annotationID) {
		if ($defined(this.annotationLayers)) {
			var layer = this.annotationLayers.get(name);
			if ($defined(layer)) {
				if ($defined(layer.annotationList)) {
					var a = layer.annotationList.get(annotationID);
					a.destroy();
					layer.annotationList.remove(annotationID);
				}
			}
		}
	},

	/**
	 * This function removes all of the annotations from a layer.
	 * 
	 * @param {String}
	 *            name Layer from which to remove all of the annotations (hash
	 *            key).
	 */
	emptyLayer : function(name) {
		if ($defined(this.annotationLayers)) {
			var layer = this.annotationLayers.get(name);
			if ($defined(layer)) {
				if ($defined(layer.annotationList)) {
					var keys = layer.annotationList.getKeys();
					for ( var i = 0; i < keys.length; i++) {
						var a = layer.annotationList.get(keys[i]);
						if ($defined(a)) {
							a.destroy();
						}
					}
					layer.annotationList.empty();
				}
			}
		}
	},

	/**
	 * This function displays the layers by drawing it on a canvas.
	 * 
	 * @param {Object}
	 *            surface The Dojo surface to be used as canvas.
	 * @param {String}
	 *            name Unique name of the layer (hash key).
	 */
	displayLayer : function(surface, name) {
		if ($defined(surface)) {
			if (dojo.isString(name)) {
				var layer = this.annotationLayers.get(name);
				if ($defined(layer)) {
					if (layer.visible === true) {
						if ($defined(layer.annotationList)) {
							var keys = layer.annotationList.getKeys();
							for ( var i = 0; i < keys.length; i++) {
								var a = layer.annotationList.get(keys[i]);
								if ($defined(a)) {
									a.draw(surface);
								}
							}
						}
					}
				} else {
					console.error("Undefined layer named '" + name + "'.");
				}
			} else {
				console.error("Undefined layer name.");
			}
		} else {
			console.error("Undefined Dojo surface.");
		}
	},

	/**
	 * This function displays all of the visible layers.
	 * 
	 * @param {Object}
	 *            Dojo surface where the annotations are to be rendered.
	 */
	displayVisibleLayers : function(surface) {
		if ($defined(this.annotationLayers)) {
			var layers = this.annotationLayers.getKeys();
			for ( var i = 0; i < layers.length; i++)
				this.displayLayer(surface, layers[i]);
		}
	}
});
