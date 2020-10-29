/*  Sistemas de Información Geográfica
    Proyecto 1: Meeli
    W. Benavides | B. Cruz | M. Rivas
    ----------------------------------
    DDL Script
*/

-- Módulo de grupos
-- pendiente...

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

