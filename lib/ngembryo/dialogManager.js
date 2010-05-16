/**
 * @projectDescription The Next-Generation Embryology Project
 * 
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 * 
 * @author gyaikhom
 * @version 0.0.1
 */
function reformatTextArea(f, n) {
	/* Remove new line characters. */
	f.value = f.value.replace(/\n/g, ''); /* Firefox. */
	f.value = f.value.replace(/\s/g, ' ').replace(/  ,/g, ''); /* IE and Opera */

	/* Check string limit. */
	if (f.value.length > n) {
		f.value = f.value.substring(0, n);
	}
}

/**
 * @classDescription This class encapsulates a dialog manager.
 * 
 * The dialog manager maintains all of the dialogs that are used by the Dojo
 * application. These include help information, about information etc., which
 * could change over time. By using Dojo.xhr Ajax interfaces, we can dynamically
 * load these information at run-time thus providing up-to-date information on
 * the dialog panels.
 */
var DialogManager = new Class(
		{
			initialize : function() {
				dialog = new dijit.Dialog( {
					id : "dialog"
				});
				dojo.body().appendChild(dialog.domNode);
				dialog.startup();
			},

			destroy : function() {

			},

			/**
			 * Sets the about information.
			 */
			setAboutDialog : function() {
				dojo
						.xhrGet( {
							url : "about.html",
							handleAs : "text",
							timeout : 5000, // Time in milliseconds
							load : function(response, ioArgs) {
								dialog
										.attr( {
											title : "About: Information about the Next-Generation Embryology Project",
											style : "height: 500px; width: 60%;",
											content : "<div align='left' style='height: 450px; overflow: auto;'>"
													+ response + "</div>"
										});
								return response;
							},

							error : function(response, ioArgs) {
								console.error("HTTP status code: ",
										ioArgs.xhr.status);
								return response;
							}
						});
			},

			/**
			 * Sets the help information.
			 */
			setHelpDialog : function() {
				dojo
						.xhrGet( {
							url : "help.html",
							handleAs : "text",
							timeout : 5000, // Time in milliseconds
							load : function(response, ioArgs) {
								dialog
										.attr( {
											title : "Help: Users' manual on using the portal",
											style : "height: 500px; width: 80%;",
											content : "<div align='left' style='height: 450px; overflow: auto;'>"
													+ response + "</div>"
										});
								return response;
							},

							error : function(response, ioArgs) {
								console.error("HTTP status code: ",
										ioArgs.xhr.status);
								return response;
							}
						});
			},

			/**
			 * Sets the  marker creation dialog.
			 * 
			 * @param {Object}
			 *            x x-coordinate of the marker.
			 * @param {Object}
			 *            y y-coordinate of the marker.
			 * @param {Object}
			 *            scale The current scale of the model.
			 * @param {Object}
			 *            lid The current layer id.
			 */
			setCreateMarkerDialog : function(x, y, scale, lid) {
				dojo
						.xhrGet( {
							url : "cmF.php?x=" + x + "&y=" + y + "&scale="
									+ scale + "&lid=" + lid,
							handleAs : "text",
							timeout : 5000, /* Time in milliseconds. */
							load : function(response, ioArgs) {
								dialog
										.attr( {
											title : "Create  marker at (" + x
													+ ", " + y + ")",
											style : "height: 375px; width: 590px;",
											content : "<div align='left' style='height: 450px; overflow: auto;'>"
													+ response + "</div>"
										});
								var theForm = dojo.byId("c2dm");
								dojo.connect(theForm, "onsubmit", function(
										event) {
									/*
									 * prevent the form from actually
									 * submitting.
									 */
									event.preventDefault();
									/* submit the form in the background. */
									dojo.xhrPost( {
										url : "cm.php",
										form : "c2dm",
										handleAs : "json",
										load : function(response, ioArgs) {
											if ($defined(response)) {
												if (response.success) {
													ngembryo.content.feedback.show("info",
															response.message);
												} else {
													ngembryo.content.feedback.show("warn",
															response.message);
												}
											} else {
												ngembryo.content.feedback.show("error",
														"Server did not respond");
											}
										}.bind(this),
										error : function(response, ioArgs) {
											ngembryo.content.feedback
													.show(
															"error",
															"HTTP status code ("
																	+ ioArgs.xhr.status
																	+ ") : Failure to process server response");
										}
									});
									dijit.byId('dialog').hide();
									ngembryo.engine.refresh();
								});
							},

							error : function(response, ioArgs) {
								console.error("HTTP status code: ",
										ioArgs.xhr.status);
							}
						});
			},

			/**
			 * Sets the  region creation dialog.
			 */
			setCreateRegionDialog : function(polyline, scale, lid) {
				var str = "";
				var i = 0;
				if (i < polyline.length) {
					while (1) {
						str += polyline[i].x + "," + polyline[i].y;
						i++;
						if (i < polyline.length) {
							str += ":";
						} else {
							break;
						}
					}
				}
				dojo
						.xhrGet( {
							url : "crF.php?polyline=" + str + "&scale="
									+ scale + "&lid=" + lid,
							handleAs : "text",
							timeout : 5000, /* Time in milliseconds. */
							load : function(response, ioArgs) {
								dialog
										.attr( {
											title : "Create  region",
											style : "height: 375px; width: 590px;",
											content : "<div align='left' style='height: 450px; overflow: auto;'>"
													+ response + "</div>"
										});
								var theForm = dojo.byId("c2dr");
								dojo.connect(theForm, "onsubmit", function(
										event) {
									/*
									 * prevent the form from actually
									 * submitting.
									 */
									event.preventDefault();
									/* submit the form in the background. */
									dojo.xhrPost( {
										url : "cr.php",
										form : "c2dr",
										handleAs : "json",
										load : function(response, ioArgs) {
											if ($defined(response)) {
												if (response.success) {
													ngembryo.content.feedback.show("info",
															response.message);
												} else {
													ngembryo.content.feedback.show("warn",
															response.message);
												}
											} else {
												ngembryo.content.feedback.show("error",
														"Server did not respond");
											}
										}.bind(this),
										error : function(response, ioArgs) {
											ngembryo.content.feedback
													.show(
															"error",
															"HTTP status code ("
																	+ ioArgs.xhr.status
																	+ ") : Failure to process server response");
										}
									});
									dijit.byId('dialog').hide();
									ngembryo.engine.refresh();
								});
							},

							error : function(response, ioArgs) {
								console.error("HTTP status code: ",
										ioArgs.xhr.status);
							}
						});
			},

			/**
			 * Displays the about dialog box.
			 */
			showAbout : function() {
				this.setAboutDialog();
				dialog.show();
			},

			/**
			 * Displays the help dialog box.
			 */
			showHelp : function() {
				this.setHelpDialog();
				dialog.show();
			},

			/**
			 * Creates a  marker at the specified coordinate.
			 * 
			 * @param {Object}
			 *            x x-coordinate of the marker.
			 * @param {Object}
			 *            y y-coordinate of the marker.
			 */
			createMarker : function(x, y, scale, dst, yaw, rol, pit) {
				this.setCreateMarkerDialog(x, y, scale, dst, yaw, rol, pit);
				dialog.show();
			},

			/**
			 * Creates a  region using the specified polyline.
			 * 
			 * @param {Object}
			 *            p Points in the polyline.
			 */
			createRegion : function(p, scale, dst, yaw, rol, pit) {
				this.setCreateRegionDialog(p, scale, dst, yaw, rol, pit);
				dialog.show();
			}
		});
