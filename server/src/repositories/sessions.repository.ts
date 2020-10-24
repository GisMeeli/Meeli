import { Repository } from '../abstractions/repository';
import { SessionModel } from '../models/session.model';

export interface SessionsRepository extends Repository {
  add(session: SessionModel): Promise<void>;

  delete(id: string): Promise<boolean>;

  get(id: string): Promise<SessionModel>;
}
