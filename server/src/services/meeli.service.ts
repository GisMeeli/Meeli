import { Service } from '../abstractions/service';
import * as ws from 'websocket';
import { MeeliAction, MeeliPoint, MeeliRequest } from '../models/meeli.models';
import { MeeliRepository } from '../repositories/meeli.repository';

export class MeeliService implements Service {
  constructor(private service: MeeliRepository) {}
  
  handle(session: string, msg: ws.IMessage): any {
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
}
