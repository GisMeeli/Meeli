import { AuthenticatedSessionModel } from '../../models/authenticated-session.model';
import { GroupCategoryModel } from '../../models/group-category.model';
import { GroupCollaboratorAttributesModel } from '../../models/group-collaborator-attributes.model';
import {
  MeeliGuestRealtimeRequest,
  MeeliMailStatusUpdate,
  MeeliPoint,
  MeeliTaxiStatusUpdate
} from '../../models/meeli.models';
import { MeeliRepository } from '../../repositories/meeli.repository';
import { PostgresConnectionManager } from './connection-manager';

export class MeeliDao implements MeeliRepository {
  async getLocationName(point: MeeliPoint): Promise<any> {
    const pg = await PostgresConnectionManager.getPool().connect();
    const result = await pg.query(
      'SELECT nom_prov, nom_cant, nom_dist FROM public.cr_distritos WHERE ST_Within(ST_SetSRID(ST_MakePoint($1, $2), 4326), geom);',
      [point.lon, point.lat]
    );

    if (0 < result.rowCount) {
      const target = result.rows[0];
      
      return {
        province: target.nom_prov,
        canton: target.nom_cant,
        district: target.nom_dist
      };
    } else return { message: 'La ubicación proporcionada está fuera del territorio de Costa Rica.' };
  }

  async removeOldMeeliSessions(): Promise<void> {
    console.log('Ejecutando rutina de eliminación de sesiones antiguas...');

    const pg = await PostgresConnectionManager.getPool().connect();
    const mail = await pg.query(
      'DELETE FROM mail.realtime WHERE ROUND((EXTRACT(EPOCH FROM now()) - EXTRACT(EPOCH FROM last_seen)) * 1000) > $1;',
      [Number.parseInt(process.env.SERVER_SESSION_TIMEOUT)]
    );
    const taxi = await pg.query(
      'DELETE FROM taxi.realtime WHERE ROUND((EXTRACT(EPOCH FROM now()) - EXTRACT(EPOCH FROM last_seen)) * 1000) > $1;',
      [Number.parseInt(process.env.SERVER_SESSION_TIMEOUT)]
    );

    pg.release();

    console.log(`Se han eliminado ${mail.rowCount + taxi.rowCount} sesiones antiguas.`);
  }

  async getRoutes(
    groupCategory: GroupCategoryModel,
    hashtag: string,
    collaboratorId: string,
    start: Date,
    end: Date
  ): Promise<any> {
    let targetFunction: string;

    if (groupCategory == GroupCategoryModel.Mail) targetFunction = 'mail.get_deliveries';
    if (groupCategory == GroupCategoryModel.Taxi) targetFunction = 'taxi.get_rides';

    console.log(start);
    console.log(end);

    const pg = await PostgresConnectionManager.getPool().connect();
    const result = await pg.query(`SELECT ${targetFunction}($1, $2, $3, $4);`, [hashtag, collaboratorId, start, end]);

    pg.release();

    return result;
  }

  private getSchema(auth: AuthenticatedSessionModel): string {
    return auth.groupCategory == GroupCategoryModel.Mail ? 'mail' : 'taxi';
  }

  async addCollaboratorSession(
    auth: AuthenticatedSessionModel,
    collaboratorAttributes: GroupCollaboratorAttributesModel
  ): Promise<void> {
    const pg = await PostgresConnectionManager.getPool().connect();

    await pg.query(
      `INSERT INTO ${this.getSchema(
        auth
      )}.realtime(session, "group", collaborator, driver_name, vehicle_plate, vehicle_brand, vehicle_model) VALUES($1, $2, $3, $4, $5, $6, $7);`,
      [
        auth.sessionId,
        auth.groupId,
        auth.memberId,
        collaboratorAttributes.driverName,
        collaboratorAttributes.vehiclePlate,
        collaboratorAttributes.vehicleBrand,
        collaboratorAttributes.vehicleModel
      ]
    );

    pg.release();
  }

  async endSession(auth: AuthenticatedSessionModel): Promise<void> {
    await this.updateCollaboratorLocation(auth, { lat: 0.0, lon: 0.0 } as MeeliPoint);

    const pg = await PostgresConnectionManager.getPool().connect();
    await pg.query(`DELETE FROM ${this.getSchema(auth)}.realtime WHERE session = $1;`, [auth.sessionId]);

    pg.release();
  }

  async getGuestRealtime(request: MeeliGuestRealtimeRequest): Promise<any> {
    const pg = await PostgresConnectionManager.getPool().connect();
    const result = await pg.query(
      `SELECT ${request.category == GroupCategoryModel.Mail ? 'mail' : 'taxi'}.get_realtime_info($1);`,
      [JSON.stringify(request.groups)]
    );

    pg.release();

    return result;
  }

  async updateCollaboratorLocation(auth: AuthenticatedSessionModel, location: MeeliPoint): Promise<any> {
    const pg = await PostgresConnectionManager.getPool().connect();

    await pg.query(
      `UPDATE ${this.getSchema(
        auth
      )}.realtime SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326), last_seen = NOW() WHERE session = $3;`,
      [location.lon, location.lat, auth.sessionId]
    );

    pg.release();
  }

  async updateMailCollaboratorStatus(auth: AuthenticatedSessionModel, update: MeeliMailStatusUpdate): Promise<boolean> {
    if (update.newDelivery) {
      const pg = await PostgresConnectionManager.getPool().connect();

      await pg.query(`UPDATE mail.realtime SET delivery_count = delivery_count + 1 WHERE session = $1;`, [
        auth.sessionId
      ]);
      pg.release();

      return true;
    }
    return false;
  }
  async updateTaxiCollaboratorStatus(auth: AuthenticatedSessionModel, update: MeeliTaxiStatusUpdate): Promise<boolean> {
    try {
      const pg = await PostgresConnectionManager.getPool().connect();

      if (update.isAvailable) {
        await pg.query('UPDATE taxi.realtime SET is_available = $1 WHERE session = $2;', [true, auth.sessionId]);
      } else {
        await pg.query('UPDATE taxi.realtime SET is_available = $1, ride_count = ride_count + 1 WHERE session = $2;', [
          false,
          auth.sessionId
        ]);
      }

      pg.release();

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  }
}
