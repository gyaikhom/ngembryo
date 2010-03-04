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
 * @classDescription This class encapsulates NGEbmryo models.
 * 
 * This stores all of the data related to models.
 */
var Models = new Class(
		{
			initialize : function() {
				this.item = new Array();

				/* TODO: This should be done using a database. */
				this.item
						.push( {
							title : "TS18",
							source : "woolztargetframe",
							stack : "/export/system1/MAWWW/html/mrciip/projects/wlziip/TS18Model.wlz",
							server : "http://127.0.0.1/fcgi-bin/wlziipsrv.fcgi",
							webpath : "/wlziip-projects/",
							fspath : "/export/system1/MAWWW/html/mrciip/projects/",
							initialdst : 123,
							assayid : "",
							imgtitle : "",
							external : "",
							tileframe : {
								enable : true
							},
							locator : {
								enable : true
							},
							sectionplane : {
								enable : true,
								src : "/export/system1/MAWWW/html/mrciip/projects/wlziip/ts18_sectionMontage.tif",
								inc : 1,
								numpit : 180,
								numyaw : 180,
								title : 'Section Plane',
								bgcolor : 'black'
							}
						});

				this.item
						.push( {
							title : "cs14_N939",
							source : "woolztargetframe",
							stack : "/net/node-00/export/data1/zsolth/CS_models/cs14_N939.wlz",
							server : "/mrciip/fcgi-bin/clusteriip.fcgi",
							webpath : "/iip-projects/",
							fspath : "/export/data0/iip/projects/",
							initialdst : 123,
							assayid : "",
							imgtitle : "",
							external : "",
							tileframe : {
								enable : true
							},
							locator : {
								enable : true,
								maxSize : [ 200, 200 ],
								pos : [ 30, -30 ]
							},
							sectionplane : {
								enable : true,
								pos : [ 30, 30 ],
								src : "/net/node-00/export/data0/home/zsolth/ts18_sectionMontage.tif",
								inc : 1,
								numpit : 180,
								numyaw : 180,
								tilesize : [ 128, 128 ],
								title : 'Section Plane',
								bgcolor : 'black'
							}
						});

				this.item
						.push( {
							title : "cs16_N1323",
							source : "woolztargetframe",
							stack : "/net/node-00/export/data1/zsolth/CS_models/cs16_N1323.wlz",
							server : "/mrciip/fcgi-bin/clusteriip.fcgi",
							webpath : "/iip-projects/",
							fspath : "/export/data0/iip/projects/",
							initialdst : 123,
							assayid : "",
							imgtitle : "",
							external : "",
							tileframe : {
								enable : true
							},
							locator : {
								enable : true,
								maxSize : [ 200, 200 ],
								pos : [ 30, -30 ]
							},
							sectionplane : {
								enable : true,
								pos : [ 30, 30 ],
								src : "/net/node-00/export/data0/home/zsolth/ts18_sectionMontage.tif",
								inc : 1,
								numpit : 180,
								numyaw : 180,
								tilesize : [ 128, 128 ],
								title : 'Section Plane',
								bgcolor : 'black'
							}
						});

				this.item
						.push( {
							title : "cs23_N336",
							source : "woolztargetframe",
							stack : "/net/node-00/export/data1/zsolth/CS_models/cs23_N336.wlz",
							server : "/mrciip/fcgi-bin/clusteriip.fcgi",
							webpath : "/iip-projects/",
							fspath : "/export/data0/iip/projects/",
							initialdst : 123,
							assayid : "",
							imgtitle : "",
							external : "",
							tileframe : {
								enable : true
							},
							locator : {
								enable : true,
								maxSize : [ 200, 200 ],
								pos : [ 30, -30 ]
							},
							sectionplane : {
								enable : true,
								pos : [ 30, 30 ],
								src : "/net/node-00/export/data0/home/zsolth/ts18_sectionMontage.tif",
								inc : 1,
								numpit : 180,
								numyaw : 180,
								tilesize : [ 128, 128 ],
								title : 'Section Plane',
								bgcolor : 'black'
							}
						});

				this.item
						.push( {
							title : "cs17_N365_inv",
							source : "woolztargetframe",
							stack : "/net/node-00/export/data1/zsolth/CS_models/cs17_N365_inv.wlz",
							server : "/mrciip/fcgi-bin/clusteriip.fcgi",
							webpath : "/iip-projects/",
							fspath : "/export/data0/iip/projects/",
							initialdst : 123,
							assayid : "",
							imgtitle : "",
							external : "",
							tileframe : {
								enable : true
							},
							locator : {
								enable : true,
								maxSize : [ 200, 200 ],
								pos : [ 30, -30 ]
							},
							sectionplane : {
								enable : true,
								pos : [ 30, 30 ],
								src : "/net/node-00/export/data0/home/zsolth/ts18_sectionMontage.tif",
								inc : 1,
								numpit : 180,
								numyaw : 180,
								tilesize : [ 128, 128 ],
								title : 'Section Plane',
								bgcolor : 'black'
							}
						});

				this.item
						.push( {
							title : "cs22_N542_inv",
							source : "woolztargetframe",
							stack : "/net/node-00/export/data1/zsolth/CS_models/cs22_N542_inv.wlz",
							server : "/mrciip/fcgi-bin/clusteriip.fcgi",
							webpath : "/iip-projects/",
							fspath : "/export/data0/iip/projects/",
							initialdst : 123,
							assayid : "",
							imgtitle : "",
							external : "",
							tileframe : {
								enable : true
							},
							locator : {
								enable : true,
								maxSize : [ 200, 200 ],
								pos : [ 30, -30 ]
							},
							sectionplane : {
								enable : true,
								pos : [ 30, 30 ],
								src : "/net/node-00/export/data0/home/zsolth/ts18_sectionMontage.tif",
								inc : 1,
								numpit : 180,
								numyaw : 180,
								tilesize : [ 128, 128 ],
								title : 'Section Plane',
								bgcolor : 'black'
							}
						});
			},

			createEmbryoModel : function(id) {
				if ($defined(woolz)) {
					woolz.destroy();
					woolz = null;
				}
				if ($defined(ngembryo.controlManager)) {
					ngembryo.controlManager.destroy();
					ngembryo.controlManager = null;
				}
				ngembryo.engine.detachDraggingEvent();
				ngembryo.engine.detachScrollEvent();
				if ($defined(ngembryo.resize)) {
					dojo.disconnect(ngembryo.resize);
				}
				ngembryo.controlManager = new ControlManager( {
					zoom : true,
					dst : true,
					navigator : true,
					roi : true,
					sec : true
				});
				woolz = new WlzIIPViewer(this.item[id]);
				ngembryo.controlManager.startup();
				ngembryo.engine.attachScrollEvent();
				ngembryo.engine.attachDraggingEvent();
				ngembryo.resize = dojo.connect(window, "onresize", function() {
					console.info("resize");
					woolz.model.setViewportSize(window.getWidth(), window
							.getHeight());
				});
				ngembryo.refresh();
			}
		});