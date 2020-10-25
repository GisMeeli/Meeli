import { AuthenticatedSessionModel } from '../../models/authenticated-session.model';
import { GroupCategoryModel } from '../../models/group-category.model';
import { GroupCollaboratorAttributesModel } from '../../models/group-collaborator-attributes.model';
import { MeeliRepository } from '../../repositories/meeli.repository';
import { PostgresConnectionManager } from './connection-manager';

export class MeeliDao implements MeeliRepository {
  async addCollaboratorSession(
    auth: AuthenticatedSessionModel,
    collaboratorAttributes: GroupCollaboratorAttributesModel
  ): Promise<void> {
    const pg = PostgresConnectionManager.getPool();

    await pg.query(
      `INSERT INTO ${
        auth.groupCategory == GroupCategoryModel.Mail ? 'mail' : 'taxi'
      }.realtime(session, "group", collaborator, driver_name, vehicle_plate, vehicle_brand, vehicle_model) VALUES($1, $2, $3, $4, $5, $6, $7);`,
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

    await pg.end();
  }
}
