import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { GroupCollaboratorAttributesModel } from '../models/group-collaborator-attributes.model';
import { MeeliGuestRealtimeRequest, MeeliPoint } from '../models/meeli.models';

export interface MeeliRepository {
  addCollaboratorSession(
    auth: AuthenticatedSessionModel,
    collaboratorAttributes: GroupCollaboratorAttributesModel
  ): Promise<void>;

  getGuestRealtime(request: MeeliGuestRealtimeRequest): Promise<any>;

  updateCollaboratorLocation(auth: AuthenticatedSessionModel, location: MeeliPoint): Promise<any>;
}
