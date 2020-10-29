import { Service } from '../abstractions/service';
import * as ws from 'websocket';
import {
  MeeliAction,
  MeeliGuestRealtimeRequest,
  MeeliMailStatusUpdate,
  MeeliPoint,
  MeeliRequest,
  MeeliTaxiStatusUpdate
} from '../models/meeli.models';
import { MeeliRepository } from '../repositories/meeli.repository';
import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { GroupsService } from './groups.service';
import { GroupCategoryModel } from '../models/group-category.model';

export class MeeliService implements Service {
  constructor(private repository: MeeliRepository, private groupsService: GroupsService) {}

  async handleCollaboratorRequest(auth: AuthenticatedSessionModel, msg: ws.IMessage): Promise<any> {
    const req = JSON.parse(msg.utf8Data) as MeeliRequest;
    let res: any;

    switch (req.action) {
      case MeeliAction.UpdateLocation:
        await this.updateCollaboratorLocation(auth, req.data as MeeliPoint);
        res = { result: 'done' };
        break;
      case MeeliAction.UpdateStatus:
        if (auth.groupCategory == GroupCategoryModel.Mail) {
          await this.updateMailStatus(auth, req.data as MeeliMailStatusUpdate);
        }
        if (auth.groupCategory == GroupCategoryModel.Taxi) {
          await this.updateTaxiStatus(auth, req.data as MeeliTaxiStatusUpdate);
        }

        res = { result: 'done' };
        break;
    }

    return res;
  }

  async handleGuestRequest(msg: ws.IMessage): Promise<any> {
    const req = JSON.parse(msg.utf8Data) as MeeliRequest;
    let res: any;

    switch (req.action) {
      case MeeliAction.GuestGetRealTimeInfo:
        res = await this.getMeeliGuestRealtime(req.data as MeeliGuestRealtimeRequest);
        break;
    }

    return res;
  }

  async initializeMeeliSession(auth: AuthenticatedSessionModel): Promise<void> {
    const collaborator = await this.groupsService.getGroupCollaborator(auth.memberId);
    await this.repository.addCollaboratorSession(auth, collaborator.customAttributes);

    console.log('Session started at GIS!');
  }

  async updateCollaboratorLocation(auth: AuthenticatedSessionModel, point: MeeliPoint): Promise<void> {
    await this.repository.updateCollaboratorLocation(auth, point);
  }

  async getMeeliGuestRealtime(req: MeeliGuestRealtimeRequest): Promise<any> {
    return await this.repository.getGuestRealtime(req);
  }

  async endSession(auth: AuthenticatedSessionModel): Promise<void> {
    await this.repository.endSession(auth);
  }

  async removeOldMeeliSessions() {
    await this.repository.removeOldMeeliSessions();
  }

  async updateMailStatus(auth: AuthenticatedSessionModel, update: MeeliMailStatusUpdate): Promise<void> {
    await this.repository.updateMailCollaboratorStatus(auth, update);
  }

  async updateTaxiStatus(auth: AuthenticatedSessionModel, update: MeeliTaxiStatusUpdate): Promise<void> {
    await this.repository.updateTaxiCollaboratorStatus(auth, update);
  }
}
