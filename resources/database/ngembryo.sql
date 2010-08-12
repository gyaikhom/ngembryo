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

insert into model (title, description, stack, server, webpath, fspath, initialdst, assayid, imgtitle, external, tileframe, locator, sectionplane, sp_src, sp_inc, sp_numpit, sp_numyaw, sp_title, sp_bgcolor, created_at) VALUES 
("Carnegie Stage 14", "A Carnegie Stage 14 human embryo OPT model from the MRC Wellcome Trust Human Developmental Biology Resource", "/net/node-00/export/data1/zsolth/CS_models/cs14_N939_mirror.wlz", "/mrciip/fcgi-bin/clusteriip.fcgi", "/iip-projects/", "/export/data0/iip/projects/", 123, "", "", "", 1, 1, 1, "/net/node-00/export/data1/zsolth/ts18_sectionMontage.tif", 1, 180, 180, 'Section Plane', 'black', NOW()),("Carnegie Stage 16", "A Carnegie Stage 16 human embryo OPT model from the MRC Wellcome Trust Human Developmental Biology Resource", "/net/node-00/export/data1/zsolth/CS_models/cs16_N1323_mirror.wlz", "/mrciip/fcgi-bin/clusteriip.fcgi", "/iip-projects/", "/export/data0/iip/projects/", 123, "", "", "", 1, 1, 1, "/net/node-00/export/data1/zsolth/ts18_sectionMontage.tif", 1, 180, 180, 'Section Plane', 'black', NOW()), ("Carnegie Stage 23", "A Carnegie Stage 23 human embryo OPT model from the MRC Wellcome Trust Human Developmental Biology Resource", "/net/node-00/export/data1/zsolth/CS_models/cs23_N336.wlz", "/mrciip/fcgi-bin/clusteriip.fcgi", "/iip-projects/", "/export/data0/iip/projects/", 123, "", "", "", 1, 1, 1, "/net/node-00/export/data1/zsolth/ts18_sectionMontage.tif", 1, 180, 180, 'Section Plane', 'black', NOW()), ("Carnegie Stage 17", "A Carnegie Stage 17 human embryo OPT model from the MRC Wellcome Trust Human Developmental Biology Resource", "/net/node-00/export/data1/zsolth/CS_models/cs17_N365_new.wlz", "/mrciip/fcgi-bin/clusteriip.fcgi", "/iip-projects/", "/export/data0/iip/projects/", 123, "", "", "", 1, 1, 1, "/net/node-00/export/data1/zsolth/ts18_sectionMontage.tif", 1, 180, 180, 'Section Plane', 'black', NOW()), ("Carnegie Stage 22", "A Carnegie Stage 22 human embryo OPT model from the MRC Wellcome Trust Human Developmental Biology Resource", "/net/node-00/export/data1/zsolth/CS_models/cs22_N542_inv.wlz", "/mrciip/fcgi-bin/clusteriip.fcgi", "/iip-projects/", "/export/data0/iip/projects/", 123, "", "", "", 1, 1, 1, "/net/node-00/export/data1/zsolth/ts18_sectionMontage.tif", 1, 180, 180, 'Section Plane', 'black', NOW());

/*
DROP USER 'ngembryo'@'localhost';
CREATE USER 'ngembryo'@'localhost' IDENTIFIED BY 'ngembryo';
*/

GRANT ALL PRIVILEGES ON ngembryo.* TO 'ngembryo'@'localhost';
