import { Repository } from '../abstractions/repository';
import { GroupCollaboratorModel } from '../models/group-collaborator.model';
import { GroupModel } from '../models/group.model';

export interface GroupsRepository extends Repository {
  addGroup(group: GroupModel): Promise<GroupModel | any>;

  addGroupCollaborator(collaborator: GroupCollaboratorModel): Promise<GroupCollaboratorModel | any>;

  deleteGroupCollaborator(id: string): Promise<boolean>;

  getGroupByHashtag(hashtag: string): Promise<GroupModel | any>;

  getGroupById(id: string): Promise<GroupModel | any>;

  getGroupCollaborator(collaboratorId: string): Promise<GroupCollaboratorModel>;

  getGroupCollaborators(groupId: string): Promise<GroupCollaboratorModel | any>;

  getGroups(): Promise<GroupModel[] | any>;
}
