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
 * @classDescription This class encapsulates the action feedback.
 * 
 * The information tipper is activated when the client receives feedback from
 * the server.
 */
var Feedback = new Class( {
	initialize : function(c) {
		this.count = 0;
	},
	show : function(t, m) {
		var uid = "feedback-" + this.count;
		var f = dojo.create("div", {
			id : uid,
			innerHTML : m,
			'class' : "feedback feedback-" + t
		}, dojo.body(), "first");
		var fadeArgs = {
			node : uid
		};
		dojo.fadeIn(fadeArgs).play();
		window.setTimeout(
				"ngembryo.content.feedback.hide(" + this.count + ");", 3500);
		this.count++;
	},
	hide : function(count) {
		var uid = "feedback-" + count;
		var fadeArgs = {
			node : uid
		};
		dojo.fadeOut(fadeArgs).play();
		dojo.destroy(uid);
		this.count--;
	},
	destroy : function() {
	}
});
