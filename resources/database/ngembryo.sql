/* Run as MySQL root user. */
DROP DATABASE IF EXISTS `ngembryo`;
CREATE DATABASE ngembryo;

USE ngembryo;

DROP TABLE IF EXISTS `model`;
CREATE TABLE model (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  stack TEXT NOT NULL,
  server TEXT NOT NULL,
  webpath TEXT NOT NULL,
  fspath TEXT NOT NULL,
  initialdst INTEGER UNSIGNED NOT NULL,
  assayid TEXT NULL,
  imgtitle TEXT NULL,
  external TEXT NULL,
  tileframe BOOLEAN NOT NULL,
  locator BOOLEAN NOT NULL,
  sectionplane BOOLEAN NOT NULL,
  sp_src TEXT NOT NULL,
  sp_inc INTEGER UNSIGNED NOT NULL,
  sp_numpit INTEGER UNSIGNED NOT NULL,
  sp_numyaw INTEGER UNSIGNED NOT NULL,
  sp_title TEXT NULL,
  sp_bgcolor TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY(id)
);


DROP TABLE IF EXISTS `orientation`;
CREATE TABLE orientation (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  model_id INTEGER UNSIGNED NOT NULL,
  title VARCHAR(255) NULL,
  summary TEXT NULL,
  description TEXT NULL,
  yaw INTEGER NOT NULL,
  pitch INTEGER NOT NULL,
  roll INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  FOREIGN KEY (model_id) REFERENCES model (id)
);

DROP TABLE IF EXISTS `layer`;
CREATE TABLE layer (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  orientation_id INTEGER UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NULL,
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  FOREIGN KEY (orientation_id) REFERENCES orientation (id)
);

DROP TABLE IF EXISTS `2Dmarker`;
CREATE TABLE 2Dmarker (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  layer_id INTEGER UNSIGNED NOT NULL,
  x INTEGER UNSIGNED NOT NULL,
  y INTEGER UNSIGNED NOT NULL,
  scale INTEGER UNSIGNED NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  FOREIGN KEY (layer_id) REFERENCES layer (id)
);

DROP TABLE IF EXISTS `2Dpolyline`;
CREATE TABLE 2Dpolyline (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  x INTEGER UNSIGNED NOT NULL,
  y INTEGER UNSIGNED NOT NULL,
  2Dregion_id INTEGER UNSIGNED NOT NULL,
  rank INTEGER UNSIGNED NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY(id, 2Dregion_id),
  INDEX 2Dpolyline_FKIndex1(2Dregion_id)
);

DROP TABLE IF EXISTS `2Dregion`;
CREATE TABLE 2Dregion (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  layer_id INTEGER UNSIGNED NOT NULL,
  scale INTEGER UNSIGNED NOT NULL,
  tl_x INTEGER UNSIGNED NOT NULL,
  tl_y INTEGER UNSIGNED NOT NULL,
  br_x INTEGER UNSIGNED NOT NULL,
  br_y INTEGER UNSIGNED NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  FOREIGN KEY (layer_id) REFERENCES layer (id)
);

DROP TABLE IF EXISTS `3Dmarker`;
CREATE TABLE 3Dmarker (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  layer_id INTEGER UNSIGNED NOT NULL,
  x INTEGER UNSIGNED NOT NULL,
  y INTEGER UNSIGNED NOT NULL,
  z INTEGER UNSIGNED NOT NULL,
  scale INTEGER UNSIGNED NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (layer_id) REFERENCES layer (id)
);

DROP TABLE IF EXISTS `resource`;
CREATE TABLE resource (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  author TEXT NOT NULL,
  title VARCHAR(255) NULL,
  abstract TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id)
);

DROP TABLE IF EXISTS `resourceItem`;
CREATE TABLE resourceItem (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  resource_id INTEGER UNSIGNED NOT NULL,
  title VARCHAR(255) NULL,
  abstract TEXT NULL,
  mime VARCHAR(255),
  link TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (resource_id) REFERENCES resource (id)
);

DROP TABLE IF EXISTS `2DmarkerResource`;
CREATE TABLE 2DmarkerResource (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  annotation_id INTEGER UNSIGNED NOT NULL,
  resource_id INTEGER UNSIGNED NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  INDEX (annotation_id, resource_id),
  FOREIGN KEY (annotation_id) REFERENCES 2Dmarker (id),
  FOREIGN KEY (resource_id) REFERENCES resource (id)
);

DROP TABLE IF EXISTS `2DregionResource`;
CREATE TABLE 2DregionResource (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  annotation_id INTEGER UNSIGNED NOT NULL,
  resource_id INTEGER UNSIGNED NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  INDEX (annotation_id, resource_id),
  FOREIGN KEY (annotation_id) REFERENCES 2Dregion (id),
  FOREIGN KEY (resource_id) REFERENCES resource (id)
);

DROP TABLE IF EXISTS `layer2Dmarker`;
CREATE TABLE layer2Dmarker (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  annotation_id INTEGER UNSIGNED NOT NULL,
  layer_id INTEGER UNSIGNED NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  INDEX (annotation_id, layer_id),
  FOREIGN KEY (annotation_id) REFERENCES 2Dmarker (id),
  FOREIGN KEY (layer_id) REFERENCES layer (id)
);

DROP TABLE IF EXISTS `layer2Dregion`;
CREATE TABLE layer2Dregion (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  annotation_id INTEGER UNSIGNED NOT NULL,
  layer_id INTEGER UNSIGNED NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  owner VARCHAR(30),
  PRIMARY KEY(id),
  INDEX (annotation_id, layer_id),
  FOREIGN KEY (annotation_id) REFERENCES 2Dregion (id),
  FOREIGN KEY (layer_id) REFERENCES layer (id)
);

DROP TABLE IF EXISTS `user`;
create table user (
  id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(30) UNIQUE,
  password VARCHAR(32),
  realname VARCHAR(100),
  email VARCHAR(100),
  affiliation TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY(id)
);

INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (1,'Theiler Stage 7','3D Model (EMA:7): TS7(5 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA7/EMA7_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA7/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:51:18','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (2,'Theiler Stage 8','3D Model (EMA:8): TS8(5.5 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA8/EMA8_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA8/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:51:18','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (3,'Theiler Stage 9','3D Model (EMA:9): TS9 (6.0 - 6.5 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA9/EMA9_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA9/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:51:18','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (4,'Theiler Stage 10','3D Model (EMA:10): TS10(7 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA10/EMA10_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA10/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:51:18','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (5,'Theiler Stage 11','3D Model (EMA:17): TS11(7.5 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA17/EMA17_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA17/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:51:18','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (6,'Theiler Stage 12','3D Model (EMA:21): TS12(8 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA21/EMA21_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA21/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (7,'Theiler Stage 13','3D Model (EMA:24): TS13(8.5 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA24/EMA24_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA24/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (8,'Theiler Stage 14','3D Model (EMA:27): TS14(9 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA27/EMA27_norm_3D_orig.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA27/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (9,'Theiler Stage 15','3D Model (EMA:28): TS15(9.5 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA28/EMA28_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA28/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (10,'Theiler Stage 16','3D Model (EMA:38): TS16(10 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA38/EMA38_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA38/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (11,'Theiler Stage 17','3D Model (EMA:49): TS17(10.5 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA49/EMA49_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA49/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (12,'Theiler Stage 18','3D Model (EMA:54): TS18(11 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA54/EMA54_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA54/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (13,'Theiler Stage 19','3D Model (EMA:65): TS19(11.5 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA65/EMA65_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA65/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (14,'Theiler Stage 20','3D Model (EMA:76): TS20(12 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA76/EMA76_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA76/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (15,'Theiler Stage 21','Caltech Atlas Model (EMA:146): TS21(12.5 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA146/EMA146_strip_112.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA146/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (16,'Theiler Stage 22','3D Model (EMA:79): TS22(13.5 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA79/EMA79_norm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA79/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (17,'Theiler Stage 23','Caltech Atlas Model (EMA:147): TS23(15 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA147/EMA147_strip_111.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA147/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (18,'Theiler Stage 24','Caltech Atlas Model (EMA:148): TS24(16 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA148/EMA148_strip_16123.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA148/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (19,'Theiler Stage 25','Caltech Atlas Model (EMA:149): TS25(17 dpc)','/export/data0/eAtlasViewer/data/ema/anatomy/EMA149/EMA149_strip_111.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/anatomy/EMA149/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);
INSERT INTO `model` (`id`,`title`,`description`,`stack`,`server`,`webpath`,`fspath`,`initialdst`,`assayid`,`imgtitle`,`external`,`tileframe`,`locator`,`sectionplane`,`sp_src`,`sp_inc`,`sp_numpit`,`sp_numyaw`,`sp_title`,`sp_bgcolor`,`updated_at`,`created_at`,`deleted_at`) VALUES (20,'Theiler Stage 26','3D Model (EMA:102): TS26(17.5 dpc)','/export/data0/eAtlasViewer/data/ema/wlz/EMA102/EMA102_norm_mm.wlz','/fcgi-bin/iip3dsrv_ema.fcgi','/iip-projects/','/export/data0/iip/projects/',123,NULL,NULL,NULL,1,1,1,'/export/data0/eAtlasViewer/data/ema/wlz/EMA102/NavigTile.tif',1,180,180,'Section Plane','black','2013-11-16 18:50:35','2013-11-16 18:50:35',NULL);

DROP USER 'ngembryo'@'localhost';
CREATE USER 'ngembryo'@'localhost' IDENTIFIED BY 'ngembryo';
GRANT ALL PRIVILEGES ON ngembryo.* TO 'ngembryo'@'localhost';
flush privileges;

