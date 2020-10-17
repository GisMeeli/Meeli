import { Repository } from '../abstractions/repository';
import { GroupModel } from '../models/group.model';

export interface GroupsRepository extends Repository {
  addGroup(group: GroupModel): Promise<GroupModel>;

  getGroup(hashtag: string): GroupModel;

  getGroups(): GroupModel[];
}
