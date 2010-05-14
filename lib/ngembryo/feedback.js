/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh
 * Funded by the JISC (http:// www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */
/**
 * @classDescription This class encapsulates the server feedback.
 * 
 * An information balloon is displayed when the client receives feedback from
 * the server. The balloon fades out after a delay.
 */
var Feedback = new Class( {
	/**
	 * Initialises a feedback engine.
	 * 
	 * @param {Integer}
	 *            fadeInDelay FadeIn delay (milliseconds).
	 * @param {Integer}
	 *            fadeOutDelay FadeOut delay (milliseconds).
	 * @param {Integer}
	 *            wait Wait before FadeOut (milliseconds).
	 * @param {Integer}
	 *            limit Maximum number of active balloons.
	 * @param {String}
	 *            idPrefix Identifier prefix for creating new DOM element.
	 */
	initialize : function(fadeInDelay, fadeOutDelay, wait, limit, idPrefix) {
		this.x = fadeInDelay;
		this.y = fadeOutDelay;
		this.w = wait;
		this.l = limit;
		this.a = 0;
		this.p = idPrefix;
		this.n = 0; /* The next balloon index. */
	},
	/**
	 * Show the balloon.
	 * 
	 * @param {String}
	 *            t Server response type.
	 * @param {String}
	 *            m Server response message.
	 */
	show : function(t, m) {
		var uid; /* Unique ID for each balloon. */
		/*
		 * It is unlikely that more than 'limit' balloons will be active at any
		 * time when the portal is running. So, we will recycle.
		 */
		if (this.n > 100) {
			this.n = 0; /* Start from the beginning. */
		} else {
			this.n++;
		}

		/* Check if the unlikely has happened. */
		uid = this.p + this.n;
		var d = dojo.byId(uid);
		if ($defined(d)) {
			this.n--; /* Next attempt should try this ID again. */
			return;
		}

		/* Safe to create a new balloon. */
		var f = dojo.create("div", {
			id : uid,
			innerHTML : m,
			/* NOTE: CSS must specify styles. */
			'class' : this.p + " " + this.p + "-" + t
		}, dojo.body(), "last");

		/* Animated fadein. */
		var d = {
			node : uid,
			duration : this.x
		};
		dojo.fadeIn(d).play();
		window.setTimeout("ngembryo.content.feedback.hide(" + this.n + ");",
				this.w);
		this.a++;
	},
	/**
	 * Hides the feedback balloon with the given index.
	 * 
	 * @param {Integer}
	 *            index Index of the feedback balloon.
	 */
	hide : function(index) {
		var uid = this.p + index;

		/* First check if the balloon has already been destroyed. */
		var t = dojo.byId(uid);
		if ($defined(t)) {
			/* Animated fadeout. */
			var d = {
				node : uid,
				duration : this.y
			};
			dojo.fadeOut(d).play();

			/* Wait for fadeOut to complete. */
			window.setTimeout("dojo.destroy('" + uid + "');", this.y);
			this.a--;
		}
	},
	/**
	 * Destroys all of the feedback balloons.
	 */
	destroy : function() {
		/* Check for leaks. */
		if (this.a > 0) {
			for ( var i = 0; i < this.l; i++) {
				var uid = this.p + i;
				var d = dojo.byId(uid);
				if ($defined(d)) {
					dojo.destroy(uid);
				}
			}
			this.a = 0;
		}
	}
});
