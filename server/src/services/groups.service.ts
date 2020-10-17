import { Service } from '../abstractions/service';
import { GroupModel } from '../models/group.model';
import { GroupsRepository } from '../repositories/groups.repository';
import { GroupModelValidator } from '../validators/group-model.validator';
import { hasValidationErrors } from '../validators/validator-utils';

export class GroupsService implements Service {
  constructor(private repository: GroupsRepository) {}

  async addGroup(group: GroupModel): Promise<GroupModel | any> {
    const validation = await new GroupModelValidator(this).validateAsync(group);

    if (hasValidationErrors(validation)) {
      return validation;
    }

    const result = await this.repository.addGroup(group);
    return result;
  }

  async getGroupByHashtag(hashtag: string): Promise<GroupModel> {
    return await this.repository.getGroupByHashtag(hashtag);
  }

  async getGroups(): Promise<GroupModel[]> {
    return await this.repository.getGroups();
  }

  async getHashtagAvailability(hashtag: string): Promise<boolean> {
    const group = await this.getGroupByHashtag(hashtag);
    return group == null || group == undefined;
  }
}
