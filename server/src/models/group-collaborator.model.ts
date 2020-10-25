import { Model } from '../abstractions/model';
import { GroupCollaboratorAttributesModel } from './group-collaborator-attributes.model';

export interface GroupCollaboratorModel extends Model {
  id: string;
  group: string;
  name: string;
  key: string;
  customAttributes: GroupCollaboratorAttributesModel | any;
  creation: Date;
}
