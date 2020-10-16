import { Model } from '../abstractions/model';

export interface GroupModel extends Model {
  id: string;
  hashtag: string;
  accessCodes: JSON;
  creation: Date;
}
