import { Repository } from '../abstractions/repository';
import { GroupModel } from '../models/group.model';

export interface GroupsRepository extends Repository {
  addGroup(group: GroupModel): GroupModel | any;

  getGroupByHashtag(hashtag: string): GroupModel | any;

  getGroupById(id: string): GroupModel | any;

  getGroups(): GroupModel[] | any;
}
