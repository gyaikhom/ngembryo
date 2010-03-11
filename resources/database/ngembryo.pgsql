--
-- Generated from mysql2pgsql.perl
-- http://gborg.postgresql.org/project/mysql2psql/
-- (c) 2001 - 2007 Jose M. Duarte, Joseph Speigle
--

-- warnings are printed for drop tables if they do not exist
-- please see http://archives.postgresql.org/pgsql-novice/2004-10/msg00158.php

-- ##############################################################
/* Run as MySQL root user. */
DROP DATABASE IF EXISTS ngembryo;
CREATE DATABASE ngembryo;
\c ngembryo

DROP TABLE "model" CASCADE\g
DROP SEQUENCE "model_id_seq" CASCADE ;

CREATE SEQUENCE "model_id_seq" ;

CREATE TABLE  "model" (
   "id" integer DEFAULT nextval('"model_id_seq"') NOT NULL,
   "title"   VARCHAR(255) NOT NULL, 
   "description"   TEXT NULL, 
   "stack"   TEXT NOT NULL, 
   "server"   TEXT NOT NULL, 
   "webpath"   TEXT NOT NULL, 
   "fspath"   TEXT NOT NULL, 
   "initialdst" INTEGER CHECK ("initialdst" >= 0) NOT NULL,
   "assayid"   TEXT NULL, 
   "imgtitle"   TEXT NULL, 
   "external"   TEXT NULL, 
   "tileframe"   BOOLEAN NOT NULL, 
   "locator"   BOOLEAN NOT NULL, 
   "sectionplane"   BOOLEAN NOT NULL, 
   "sp_src"   TEXT NOT NULL, 
   "sp_inc" INTEGER CHECK ("sp_inc" >= 0) NOT NULL,
   "sp_numpit" INTEGER CHECK ("sp_numpit" >= 0) NOT NULL,
   "sp_numyaw" INTEGER CHECK ("sp_numyaw" >= 0) NOT NULL,
   "sp_title"   TEXT NULL, 
   "sp_bgcolor"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id)
);
 CREATE OR REPLACE FUNCTION update_model() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_model BEFORE UPDATE ON "model" FOR EACH ROW EXECUTE PROCEDURE
update_model();


DROP TABLE "orientation" CASCADE\g
DROP SEQUENCE "orientation_id_seq" CASCADE ;

CREATE SEQUENCE "orientation_id_seq" ;

CREATE TABLE  "orientation" (
   "id" integer DEFAULT nextval('"orientation_id_seq"') NOT NULL,
   "mid" INTEGER CHECK ("mid" >= 0) NOT NULL,
   "title"   VARCHAR(255) NULL, 
   "summary"   TEXT NULL, 
   "description"   TEXT NULL, 
   "yaw"   INTEGER NOT NULL, 
   "pitch"   INTEGER NOT NULL, 
   "roll"   INTEGER NOT NULL, 
   "distance"   INTEGER NOT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "foreign"   KEY (mid) REFERENCES model (id) 
);
 CREATE OR REPLACE FUNCTION update_orientation() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_orientation BEFORE UPDATE ON "orientation" FOR EACH ROW EXECUTE PROCEDURE
update_orientation();

DROP TABLE "layer" CASCADE\g
DROP SEQUENCE "layer_id_seq" CASCADE ;

CREATE SEQUENCE "layer_id_seq" ;

CREATE TABLE  "layer" (
   "id" integer DEFAULT nextval('"layer_id_seq"') NOT NULL,
   "orientation_id" INTEGER CHECK ("orientation_id" >= 0) NOT NULL,
   "title"   VARCHAR(255) NOT NULL, 
   "summary"   TEXT NULL, 
   "description"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "foreign"   KEY (orientation_id) REFERENCES orientation (id) 
);
 CREATE OR REPLACE FUNCTION update_layer() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_layer BEFORE UPDATE ON "layer" FOR EACH ROW EXECUTE PROCEDURE
update_layer();

DROP TABLE "2dmarker" CASCADE\g
DROP SEQUENCE "2dmarker_id_seq" CASCADE ;

CREATE SEQUENCE "2dmarker_id_seq" ;

CREATE TABLE  "2dmarker" (
   "id" integer DEFAULT nextval('"2dmarker_id_seq"') NOT NULL,
   "layer_id" INTEGER CHECK ("layer_id" >= 0) NOT NULL,
   "x" INTEGER CHECK ("x" >= 0) NOT NULL,
   "y" INTEGER CHECK ("y" >= 0) NOT NULL,
   "scale" INTEGER CHECK ("scale" >= 0) NOT NULL,
   "label"   VARCHAR(255) NOT NULL, 
   "description"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "foreign"   KEY (layer_id) REFERENCES layer (id) 
);
 CREATE OR REPLACE FUNCTION update_2Dmarker() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_2Dmarker BEFORE UPDATE ON "2dmarker" FOR EACH ROW EXECUTE PROCEDURE
update_2Dmarker();

DROP TABLE "2dpolyline" CASCADE\g
DROP SEQUENCE "2dpolyline_id_seq" CASCADE ;

CREATE SEQUENCE "2dpolyline_id_seq" ;

CREATE TABLE  "2dpolyline" (
   "id" integer DEFAULT nextval('"2dpolyline_id_seq"') NOT NULL,
   "x" INTEGER CHECK ("x" >= 0) NOT NULL,
   "y" INTEGER CHECK ("y" >= 0) NOT NULL,
   "2dregion_id" INTEGER CHECK ("2dregion_id" >= 0) NOT NULL,
   "rank" INTEGER CHECK ("rank" >= 0) NOT NULL,
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id, 2Dregion_id),
   "index"   2Dpolyline_FKIndex1(2Dregion_id) 
);
 CREATE OR REPLACE FUNCTION update_2Dpolyline() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_2Dpolyline BEFORE UPDATE ON "2dpolyline" FOR EACH ROW EXECUTE PROCEDURE
update_2Dpolyline();

DROP TABLE "2dregion" CASCADE\g
DROP SEQUENCE "2dregion_id_seq" CASCADE ;

CREATE SEQUENCE "2dregion_id_seq" ;

CREATE TABLE  "2dregion" (
   "id" integer DEFAULT nextval('"2dregion_id_seq"') NOT NULL,
   "layer_id" INTEGER CHECK ("layer_id" >= 0) NOT NULL,
   "scale" INTEGER CHECK ("scale" >= 0) NOT NULL,
   "tl_x" INTEGER CHECK ("tl_x" >= 0) NOT NULL,
   "tl_y" INTEGER CHECK ("tl_y" >= 0) NOT NULL,
   "br_x" INTEGER CHECK ("br_x" >= 0) NOT NULL,
   "br_y" INTEGER CHECK ("br_y" >= 0) NOT NULL,
   "label"   VARCHAR(255) NOT NULL, 
   "description"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "foreign"   KEY (layer_id) REFERENCES layer (id) 
);
 CREATE OR REPLACE FUNCTION update_2Dregion() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_2Dregion BEFORE UPDATE ON "2dregion" FOR EACH ROW EXECUTE PROCEDURE
update_2Dregion();

DROP TABLE "3dmarker" CASCADE\g
DROP SEQUENCE "3dmarker_id_seq" CASCADE ;

CREATE SEQUENCE "3dmarker_id_seq" ;

CREATE TABLE  "3dmarker" (
   "id" integer DEFAULT nextval('"3dmarker_id_seq"') NOT NULL,
   "layer_id" INTEGER CHECK ("layer_id" >= 0) NOT NULL,
   "x" INTEGER CHECK ("x" >= 0) NOT NULL,
   "y" INTEGER CHECK ("y" >= 0) NOT NULL,
   "z" INTEGER CHECK ("z" >= 0) NOT NULL,
   "scale" INTEGER CHECK ("scale" >= 0) NOT NULL,
   "label"   VARCHAR(255) NOT NULL, 
   "description"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "foreign"   KEY (layer_id) REFERENCES layer (id) 
);
 CREATE OR REPLACE FUNCTION update_3Dmarker() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_3Dmarker BEFORE UPDATE ON "3dmarker" FOR EACH ROW EXECUTE PROCEDURE
update_3Dmarker();

DROP TABLE "resource" CASCADE\g
DROP SEQUENCE "resource_id_seq" CASCADE ;

CREATE SEQUENCE "resource_id_seq" ;

CREATE TABLE  "resource" (
   "id" integer DEFAULT nextval('"resource_id_seq"') NOT NULL,
   "author"   TEXT NOT NULL, 
   "title"   VARCHAR(255) NULL, 
   "abstract"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id)
);
 CREATE OR REPLACE FUNCTION update_resource() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_resource BEFORE UPDATE ON "resource" FOR EACH ROW EXECUTE PROCEDURE
update_resource();

DROP TABLE "resourceitem" CASCADE\g
DROP SEQUENCE "resourceitem_id_seq" CASCADE ;

CREATE SEQUENCE "resourceitem_id_seq" ;

CREATE TABLE  "resourceitem" (
   "id" integer DEFAULT nextval('"resourceitem_id_seq"') NOT NULL,
   "resource_id" INTEGER CHECK ("resource_id" >= 0) NOT NULL,
   "title"   VARCHAR(255) NULL, 
   "abstract"   TEXT NULL, 
   "mime"   VARCHAR(255), 
   "link"   TEXT NULL, 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "foreign"   KEY (resource_id) REFERENCES resource (id) 
);
 CREATE OR REPLACE FUNCTION update_resourceItem() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_resourceItem BEFORE UPDATE ON "resourceitem" FOR EACH ROW EXECUTE PROCEDURE
update_resourceItem();

DROP TABLE "2dmarkerresource" CASCADE\g
DROP SEQUENCE "2dmarkerresource_id_seq" CASCADE ;

CREATE SEQUENCE "2dmarkerresource_id_seq" ;

CREATE TABLE  "2dmarkerresource" (
   "id" integer DEFAULT nextval('"2dmarkerresource_id_seq"') NOT NULL,
   "annotation_id" INTEGER CHECK ("annotation_id" >= 0) NOT NULL,
   "resource_id" INTEGER CHECK ("resource_id" >= 0) NOT NULL,
  PRIMARY KEY(id),
   "index"   (annotation_id, resource_id), 
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
   "foreign"   KEY (annotation_id) REFERENCES 2Dmarker (id), 
   "foreign"   KEY (resource_id) REFERENCES resource (id) 
);
 CREATE OR REPLACE FUNCTION update_2DmarkerResource() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_2DmarkerResource BEFORE UPDATE ON "2dmarkerresource" FOR EACH ROW EXECUTE PROCEDURE
update_2DmarkerResource();

DROP TABLE "2dregionresource" CASCADE\g
DROP SEQUENCE "2dregionresource_id_seq" CASCADE ;

CREATE SEQUENCE "2dregionresource_id_seq" ;

CREATE TABLE  "2dregionresource" (
   "id" integer DEFAULT nextval('"2dregionresource_id_seq"') NOT NULL,
   "annotation_id" INTEGER CHECK ("annotation_id" >= 0) NOT NULL,
   "resource_id" INTEGER CHECK ("resource_id" >= 0) NOT NULL,
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "index"   (annotation_id, resource_id), 
   "foreign"   KEY (annotation_id) REFERENCES 2Dregion (id), 
   "foreign"   KEY (resource_id) REFERENCES resource (id) 
);
 CREATE OR REPLACE FUNCTION update_2DregionResource() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_2DregionResource BEFORE UPDATE ON "2dregionresource" FOR EACH ROW EXECUTE PROCEDURE
update_2DregionResource();

DROP TABLE "layer2dmarker" CASCADE\g
DROP SEQUENCE "layer2dmarker_id_seq" CASCADE ;

CREATE SEQUENCE "layer2dmarker_id_seq" ;

CREATE TABLE  "layer2dmarker" (
   "id" integer DEFAULT nextval('"layer2dmarker_id_seq"') NOT NULL,
   "annotation_id" INTEGER CHECK ("annotation_id" >= 0) NOT NULL,
   "layer_id" INTEGER CHECK ("layer_id" >= 0) NOT NULL,
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "index"   (annotation_id, layer_id), 
   "foreign"   KEY (annotation_id) REFERENCES 2Dmarker (id), 
   "foreign"   KEY (layer_id) REFERENCES layer (id) 
);
 CREATE OR REPLACE FUNCTION update_layer2Dmarker() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_layer2Dmarker BEFORE UPDATE ON "layer2dmarker" FOR EACH ROW EXECUTE PROCEDURE
update_layer2Dmarker();

DROP TABLE "layer2dregion" CASCADE\g
DROP SEQUENCE "layer2dregion_id_seq" CASCADE ;

CREATE SEQUENCE "layer2dregion_id_seq" ;

CREATE TABLE  "layer2dregion" (
   "id" integer DEFAULT nextval('"layer2dregion_id_seq"') NOT NULL,
   "annotation_id" INTEGER CHECK ("annotation_id" >= 0) NOT NULL,
   "layer_id" INTEGER CHECK ("layer_id" >= 0) NOT NULL,
   "updated_at"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP , 
   "created_at"   timestamp without time zone DEFAULT NULL, 
  PRIMARY KEY(id),
   "index"   (annotation_id, layer_id), 
   "foreign"   KEY (annotation_id) REFERENCES 2Dregion (id), 
   "foreign"   KEY (layer_id) REFERENCES layer (id) 
);
 CREATE OR REPLACE FUNCTION update_layer2Dregion() RETURNS trigger AS '
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP; 
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- before INSERT is handled by 'default CURRENT_TIMESTAMP'
CREATE TRIGGER add_current_date_to_layer2Dregion BEFORE UPDATE ON "layer2dregion" FOR EACH ROW EXECUTE PROCEDURE
update_layer2Dregion();
DROP USER 'ngembryo'@'localhost';
CREATE USER 'ngembryo'@'localhost' IDENTIFIED BY 'ngembryo';
GRANT ALL PRIVILEGES ON ngembryo.* TO 'ngembryo'@'localhost';
