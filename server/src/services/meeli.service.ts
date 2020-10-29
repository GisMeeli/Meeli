import { Service } from '../abstractions/service';
import * as ws from 'websocket';
import { MeeliAction, MeeliGuestRealtimeRequest, MeeliPoint, MeeliRequest } from '../models/meeli.models';
import { MeeliRepository } from '../repositories/meeli.repository';
import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { GroupsService } from './groups.service';

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
}
