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
var Feedback = new Class(
		{
			initialize : function(c) {
				var f = dojo.create("div", {
					id : "feedback",
					style : "visibility: hidden;",
					innerHTML : "Hello"
				}, c);
			},
			show : function(t, m) {
				var c;
				var bc;

				/* Set color of feedback. */
				if (t == 'error') {
					c = "#FFFFFF";
					bc = "#FF0000";
				} else {
					if (t == 'warning') {
						c = "#FFFFFF";
						bc = "#005500";
					} else {
						c = "#FFFFFF";
						bc = "#000000";
					}
				}
				dojo.attr("feedback", {
					innerHTML : m
				});
				dojo.attr("feedback", "style", {
					visibility : "visible",
					color : c,
					background : bc
				});
				var fadeArgs = {
					node : 'feedback'
				};
				dojo.fadeIn(fadeArgs).play();
				setTimeout(
						"var fadeArgs = {node:'feedback'};dojo.fadeOut(fadeArgs).play();",
						2000);
			},
			hide : function() {
				dojo.attr("feedback", "style", {
					visibility : "hidden"
				});
			},
			destroy : function() {
				dojo.destroy("feedback");
			}
		});
