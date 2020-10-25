import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { GroupCollaboratorAttributesModel } from '../models/group-collaborator-attributes.model';

export interface MeeliRepository {
  addCollaboratorSession(
    auth: AuthenticatedSessionModel,
    collaboratorAttributes: GroupCollaboratorAttributesModel
  ): Promise<void>;
}
