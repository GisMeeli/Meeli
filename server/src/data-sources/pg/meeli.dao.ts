import { AuthenticatedSessionModel } from '../../models/authenticated-session.model';
import { GroupCategoryModel } from '../../models/group-category.model';
import { GroupCollaboratorAttributesModel } from '../../models/group-collaborator-attributes.model';
import { MeeliPoint } from '../../models/meeli.models';
import { MeeliRepository } from '../../repositories/meeli.repository';
import { PostgresConnectionManager } from './connection-manager';

export class MeeliDao implements MeeliRepository {
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

  async updateCollaboratorLocation(auth: AuthenticatedSessionModel, location: MeeliPoint): Promise<any> {
    const pg = await PostgresConnectionManager.getPool().connect();

    await pg.query(`UPDATE ${this.getSchema(auth)}.realtime SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE session = $3;`, [
      location.lon,
      location.lat,
      auth.sessionId
    ]);

    pg.release();
  }
}
