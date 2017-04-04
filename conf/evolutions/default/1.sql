# Users schema
# --- !Ups

create table PIXELAND (VERSION SERIAL PRIMARY KEY, PIXELS bytea);

# --- !Downs

DROP TABLE PIXELAND;