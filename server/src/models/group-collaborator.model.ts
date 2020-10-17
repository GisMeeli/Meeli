import { Model } from '../abstractions/model';

export interface GroupCollaboratorModel extends Model {
  group: string;
  key: string;
  creation: Date;
}
