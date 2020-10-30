/*  Sistemas de Información Geográfica
    Proyecto 1: Meeli
    W. Benavides | B. Cruz | M. Rivas
    ----------------------------------
    DDL Script
*/

-- Módulo de grupos

create table if not exists public."group"
(
	id uuid default uuid_generate_v4() not null
		constraint "PK_256aa0fda9b1de1a73ee0b7106b"
			primary key,
	hashtag varchar(48) not null
		constraint "UQ_bf776e4395f8551a31979b164b0"
			unique,
	name varchar(48) not null,
	description varchar(1024),
	admin_key varchar(32) not null,
	category smallint not null
		constraint "CHK_00bcce22c887958662586df00c"
			check ((category = 1) OR (category = 2)),
	custom_attributes json default '{ }'::json not null,
	creation timestamp default now() not null
);

create table if not exists public.group_collaborator
(
	id uuid default uuid_generate_v4() not null
		constraint "PK_9d5f2a181d2193e9cb62d416753"
			primary key,
	"group" varchar not null,
	name varchar(32) not null,
	key varchar(32) not null,
	creation timestamp default now() not null,
	custom_attributes jsonb default '{}'::jsonb not null
);


-- Módulo de correo

CREATE SCHEMA mail;

CREATE TABLE mail.history
(
    session         uuid                                           NOT NULL,
    "group"         uuid REFERENCES public.group(id)               NOT NULL,
    collaborator    uuid REFERENCES public.group_collaborator(id)  NOT NULL,
    driver_name     character varying(32),
    vehicle_plate   character varying(12),
    vehicle_brand   character varying(32),
    vehicle_model   character varying(32),
    last_seen       timestamp                                      NOT NULL DEFAULT NOW(),
    delivery_count  smallint                                       NOT NULL DEFAULT 0
);

SELECT AddGeometryColumn('mail', 'history', 'geom', 4326, 'POINT', 2, false);

CREATE TABLE mail.realtime
(
    session         uuid                                           NOT NULL PRIMARY KEY,
    "group"         uuid REFERENCES public.group (id)              NOT NULL,
    collaborator    uuid REFERENCES public.group_collaborator (id) NOT NULL,
    driver_name     character varying(32),
    vehicle_plate   character varying(12),
    vehicle_brand   character varying(32),
    vehicle_model   character varying(32),
    last_seen       timestamp                                      NOT NULL DEFAULT NOW(),
    delivery_count  smallint                                       NOT NULL DEFAULT 0
);

SELECT AddGeometryColumn('mail', 'realtime', 'geom', 4326, 'POINT', 2, false);

CREATE OR REPLACE FUNCTION mail_backup_current_row()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO mail.history(session, "group", collaborator, driver_name, vehicle_plate, vehicle_brand, vehicle_model,
                             last_seen, delivery_count, geom)
    VALUES (OLD.session, OLD."group", OLD.collaborator, OLD.driver_name, OLD.vehicle_plate, OLD.vehicle_brand,
            OLD.vehicle_model, OLD.last_seen, OLD.delivery_count, OLD.geom);

    return NEW;
END;
$$;

CREATE TRIGGER tr_mail_backup_last_row
  BEFORE UPDATE
  ON mail.realtime
  FOR EACH ROW
  EXECUTE PROCEDURE mail_backup_current_row();

create function mail.get_deliveries(_hashtag character varying, _collaborator uuid, _start timestamp without time zone, _end timestamp without time zone) returns jsonb
    language plpgsql
as
$$
declare
	_json jsonb;
 begin
 	with _query as (
		select * from (
				select mh.collaborator, first(mh.delivery_count), first(g.hashtag), first(geom), first(mh.last_seen),
				first(mh.driver_name), first(mh.vehicle_brand), first(mh.vehicle_model), first(mh.vehicle_plate)
				from mail.history mh inner join public."group" g on g.id = mh."group"
				where mh.collaborator = COALESCE(_collaborator, mh.collaborator) and g.hashtag = COALESCE(_hashtag, g.hashtag)
				and mh.last_seen between COALESCE(_start, mh.last_seen) and COALESCE(_end, mh.last_seen)
				group by mh.session, mh.collaborator, mh.delivery_count
			) r
	)
 
 	select json_build_object(
		'records', array_to_json(array_agg(row_to_json(_query))), 
		 'bounding_box', st_envelope(st_collect(_query.track))) 
	into _json from _query;
	
	return _json;
end;
$$;

create function mail.get_realtime_info(_groups json) returns jsonb
    language plpgsql
as
$$
DECLARE 
		_json jsonb;
	BEGIN
		with _query as (
			select g.hashtag, mrt.* from mail.realtime mrt inner join
			(select g.id, g.hashtag from json_array_elements_text(_groups) a 
			inner join public.group g on g.hashtag = a.value) g
			on mrt."group" = g.id
		)
		select json_build_object(
		'records', array_to_json(array_agg(row_to_json(_query))), 
		 'bounding_box', st_envelope(st_collect(_query.geom))) 
		into _json from _query;
			
			
		return _json;
	END
$$;

-- Módulo de taxis
CREATE SCHEMA taxi;

CREATE TABLE taxi.history
(
    session       uuid                                           NOT NULL,
    "group"       uuid REFERENCES public.group (id)              NOT NULL,
    collaborator  uuid REFERENCES public.group_collaborator (id) NOT NULL,
    driver_name   character varying(32),
    vehicle_plate character varying(12),
    vehicle_brand character varying(32),
    vehicle_model character varying(32),
    last_seen     timestamp                                      NOT NULL DEFAULT NOW(),
    is_available  boolean                                        NOT NULL DEFAULT true,
    ride_count    smallint                                       NOT NULL DEFAULT 0
);

SELECT AddGeometryColumn('taxi', 'history', 'geom', 4326, 'POINT', 2, false);

CREATE TABLE taxi.realtime
(
    session       uuid                                           NOT NULL PRIMARY KEY,
    "group"       uuid REFERENCES public.group (id)              NOT NULL,
    collaborator  uuid REFERENCES public.group_collaborator (id) NOT NULL,
    driver_name   character varying(32),
    vehicle_plate character varying(12),
    vehicle_brand character varying(32),
    vehicle_model character varying(32),
    last_seen     timestamp                                      NOT NULL DEFAULT NOW(),
    is_available  boolean                                        NOT NULL DEFAULT true,
    ride_count    smallint                                       NOT NULL DEFAULT 0
);
SELECT AddGeometryColumn('taxi', 'realtime', 'geom', 4326, 'POINT', 2, false);

CREATE OR REPLACE FUNCTION taxi_backup_current_row()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO taxi.history(session, "group", collaborator, driver_name, vehicle_plate, vehicle_brand, vehicle_model,
                             last_seen, is_available, ride_count, geom)
    VALUES (OLD.session, OLD."group", OLD.collaborator, OLD.driver_name, OLD.vehicle_plate, OLD.vehicle_brand,
            OLD.vehicle_model, OLD.last_seen, OLD.is_available, OLD.ride_count, OLD.geom);

    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_taxi_backup_last_row
  BEFORE UPDATE
  ON taxi.realtime
  FOR EACH ROW
  EXECUTE PROCEDURE taxi_backup_current_row();


create function taxi.get_realtime_info(_groups json) returns jsonb
    language plpgsql
as
$$
DECLARE 
		_json jsonb;
	BEGIN
		with _query as (
			select g.hashtag, trt.* from taxi.realtime trt inner join
			(select g.id, g.hashtag from json_array_elements_text(_groups) a 
			inner join public.group g on g.hashtag = a.value) g
			on trt."group" = g.id
		)
		select json_build_object(
		'records', array_to_json(array_agg(row_to_json(_query))), 
		 'bounding_box', st_envelope(st_collect(_query.geom))) 
		into _json from _query;
			
			
		return _json;
	END
$$;

create function taxi.get_rides(_hashtag character varying, _collaborator uuid, _start timestamp without time zone, _end timestamp without time zone) returns jsonb
    language plpgsql
as
$$
declare
	_json jsonb;
 begin
 	with _query as (
		select *, st_length(st_transform(track, 5367)) metters from (
				select th.collaborator, th.ride_count, g.hashtag, st_makeline(geom) track,
				min(th.last_seen) "start", max(th.last_seen) "end", 
				th.driver_name, th.vehicle_brand, th.vehicle_model, th.vehicle_plate
				from taxi.history th inner join public."group" g on g.id = th."group"
				where is_available = false and th.collaborator = COALESCE(_collaborator, th.collaborator) and g.hashtag = COALESCE(_hashtag, g.hashtag)
				group by th.session, th.collaborator, th.ride_count, g.hashtag, 
				th.driver_name, th.vehicle_brand, th.vehicle_model, th.vehicle_plate
			) r where r."start" <= COALESCE(_start, r."start") and r."end" >= COALESCE(_end, r."end")
	)
 
 	select json_build_object(
		'records', array_to_json(array_agg(row_to_json(_query))), 
		 'bounding_box', st_envelope(st_collect(_query.track))) 
	into _json from _query;
	
	return _json;
end;
$$;