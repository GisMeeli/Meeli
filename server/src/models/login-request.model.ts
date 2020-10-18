import { Model } from '../abstractions/model';
import { GroupMemberRoleModel } from './group-member-role.model';

export interface LoginRequestModel extends Model {
  key: string;
  role: GroupMemberRoleModel;
}
