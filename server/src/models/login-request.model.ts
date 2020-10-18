import { Model } from '../abstractions/model';
import { GroupMemberRoleModel } from './group-member-role.model';

export interface LoginRequestModel extends Model {
  group: string;
  key: string;
  role: GroupMemberRoleModel;
}
