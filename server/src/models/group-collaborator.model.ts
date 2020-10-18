import { Model } from '../abstractions/model';

export interface GroupCollaboratorModel extends Model {
  id: string;
  group: string;
  name: string;
  key: string;
  creation: Date;
}
