import { SessionModel } from '../../models/session.model';
import { SessionsRepository } from '../../repositories/sessions.repository';
import {} from "redis";
export class SessionsDao implements SessionsRepository {
  add(session: SessionModel): Promise<void> {
    return;
    //throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  get(id: string): Promise<SessionModel> {
    throw new Error('Method not implemented.');
  }
}
