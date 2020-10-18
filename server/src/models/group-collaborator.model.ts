import { Model } from '../abstractions/model';

export interface GroupCollaboratorModel extends Model {
  id: string;
  group: string;
  key: string;
  creation: Date;
}
