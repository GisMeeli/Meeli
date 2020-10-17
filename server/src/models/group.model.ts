import { Model } from '../abstractions/model';

export interface GroupModel extends Model {
  id: string;
  hashtag: string;
  name: string;
  description: string;
  adminKey: string;
  customAttributes: JSON;
  creation: Date;
}
