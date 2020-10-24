import { Model } from '../abstractions/model';

export interface SessionModel extends Model {
  id: string;
  group: string;
  member: string;
  creation: Date;
  lastSeen: Date;
}
