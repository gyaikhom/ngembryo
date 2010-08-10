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

INSERT INTO user (username, password, realname, email, affiliation, created_at) VALUES ('admin', MD5('administrator'), 'Rosa Spencer', 'rosa.spencer@newcastle.ac.uk', 'Newcastle University', NOW());
alter table orientation add owner VARCHAR(30) after deleted_at;
alter table layer add owner VARCHAR(30) after deleted_at;
alter table 2Dmarker add owner VARCHAR(30) after deleted_at;
alter table 2Dregion add owner VARCHAR(30) after deleted_at;
alter table 2DmarkerResource add owner VARCHAR(30) after deleted_at;
alter table 2DregionResource add owner VARCHAR(30) after deleted_at;
alter table resource add owner VARCHAR(30) after deleted_at;
alter table layer2Dmarker add owner VARCHAR(30) after deleted_at;
alter table layer2Dregion add owner VARCHAR(30) after deleted_at;

update orientation set owner='admin';
update layer set owner='admin';
update resource set owner='admin';
update 2Dmarker set owner='admin';
update 2Dregion set owner='admin';
update layer2Dmarker set owner='admin';
update layer2Dregion set owner='admin';
update 2DmarkerResource set owner='admin';
update 2DregionResource set owner='admin';
