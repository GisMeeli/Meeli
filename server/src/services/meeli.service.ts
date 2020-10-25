import { Service } from '../abstractions/service';
import * as ws from 'websocket';
import { MeeliAction, MeeliPoint, MeeliRequest } from '../models/meeli.models';
import { MeeliRepository } from '../repositories/meeli.repository';
import { AuthenticatedSessionModel } from '../models/authenticated-session.model';
import { GroupsService } from './groups.service';

export class MeeliService implements Service {
  constructor(private repository: MeeliRepository, private groupsService:GroupsService) {}

  handle(auth: AuthenticatedSessionModel, msg: ws.IMessage): any {
    const req = JSON.parse(msg.utf8Data) as MeeliRequest;
    let res: any;

    switch (req.action) {
      case MeeliAction.UpdateLocation:
        const data = req.data as MeeliPoint;
        console.log(data);

        res = { a: 'hola' };
        break;
    }

    return res;
  }

  async initializeMeeliSession(auth: AuthenticatedSessionModel): Promise<void> {
    const collaborator = await this.groupsService.getGroupCollaborator(auth.memberId);
    await this.repository.addCollaboratorSession(auth, collaborator.customAttributes);

    console.log("Session started at GIS!");
  }
}
