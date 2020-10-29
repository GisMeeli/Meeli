import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { GroupCategoryModel } from '../models/group-category.model';
import { GroupCollaboratorAttributesModel } from '../models/group-collaborator-attributes.model';
import {
  MeeliGuestRealtimeRequest,
  MeeliMailStatusUpdate,
  MeeliPoint,
  MeeliTaxiStatusUpdate
} from '../models/meeli.models';

export interface MeeliRepository {
  addCollaboratorSession(
    auth: AuthenticatedSessionModel,
    collaboratorAttributes: GroupCollaboratorAttributesModel
  ): Promise<void>;

  endSession(auth: AuthenticatedSessionModel): Promise<void>;

  getGuestRealtime(request: MeeliGuestRealtimeRequest): Promise<any>;

  getRoutes(
    groupCategory: GroupCategoryModel,
    hashtag: string,
    collaboratorId: string,
    start: Date,
    end: Date
  ): Promise<any>;

  removeOldMeeliSessions(): Promise<void>;

  updateCollaboratorLocation(auth: AuthenticatedSessionModel, location: MeeliPoint): Promise<any>;

  updateMailCollaboratorStatus(auth: AuthenticatedSessionModel, update: MeeliMailStatusUpdate): Promise<boolean>;

  updateTaxiCollaboratorStatus(auth: AuthenticatedSessionModel, update: MeeliTaxiStatusUpdate): Promise<boolean>;
}
