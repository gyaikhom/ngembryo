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
 * @classDescription This class encapsulates an icon manager.
 * 
 * Icons are used for displaying marker. Users are allowed to use their own
 * choice of icons, and the IconManager assist the user with the management.
 */
var IconManager = Class( {
	/* All of the icons are stored in this hash. */
	annotationIcons : new Hash(),

	/**
	 * This function registers an icon with the IconManager.
	 * 
	 * @param {String}
	 *            name Unique name of the icon (hash key).
	 * @param {Object}
	 *            icon Icon object to be registered.
	 */
	registerIcon : function(name, icon) {
		if ($defined(this.annotationIcons)) {
			if (dojo.isString(name)) {
				if (dojo.isObject(icon)) {
					icon.name = name;
					this.annotationIcons.set(name, icon);
				} else {
					console.error("Undefined icon object.");
				}
			} else {
				console.error("Undefined icon name.");
			}
		} else {
			console.error("Undefined annotation icon hash.");
		}
	},

	/**
	 * This function un-registers an icon from the IconManager.
	 * 
	 * @param {Object}
	 *            name Unique name of the icon (hash key).
	 */
	unregisterIcon : function(name) {
		if ($defined(this.annotationIcons)) {
			if (dojo.isString(name)) {
				this.annotationIcons.remove(name);
			} else {
				console.error("Undefined icon name.");
			}
		} else {
			console.error("Undefined annotation icon hash.");
		}
	},

	/**
	 * Returns the default icon object defined by the IconManager.
	 * 
	 * @return {Object} Icon object.
	 */
	__getDefaultIcon : function() {
		console.warn("Using default icon.");
		icon = this.annotationIcons.get('default');
		if (!$defined(icon)) {
			console.warn("Registering default icon.");
			icon = createIcon("resources/images/bookmark.png", 16, 16, 'rr');
			if ($defined(icon)) {
				registerIcon('default', icon);
			} else {
				console.error("Could not register default icon.");
			}
		}
		return icon;
	},

	/**
	 * Returns an icon object with the supplied name.
	 * 
	 * If an icon with the supplied name is not found, the default icon object
	 * will be returned.
	 * 
	 * @param {String}
	 *            name Name of the icon object (hash key).
	 * @return {Object} Icon object.
	 */
	getIcon : function(name) {
		if ($defined(this.annotationIcons)) {
			if ($defined(name)) {
				var icon = this.annotationIcons.get(name);
				if (!$defined(icon)) {
					icon = this.__getDefaultIcon();
				}
				return icon;
			} else {
				console.error("Undefined icon name. Using default icon.");
				return this.__getDefaultIcon();
			}
		} else {
			console.error("Annotation icon hash undefined.");
		}
		return null;
	},

	/**
	 * Destroys icon manager.
	 */
	destroy : function() {
		if ($defined(this.annotationsIcons)) {
			this.annotationsIcons.empty();
			this.annotationsIcons = null;
		}
	}
});
