import { Service } from '../abstractions/service';
import { GroupModel } from '../models/group.model';
import { GroupsRepository } from '../repositories/groups.repository';
import { buildErrorResponse } from '../utils/service-response-handler';
import { GroupModelValidator } from '../validators/group-model.validator';
import { hasValidationErrors } from '../validators/validator-utils';

export class GroupsService implements Service {
  constructor(private repository: GroupsRepository) {}

  async addGroup(group: GroupModel): Promise<GroupModel | any> {
    const validation = await new GroupModelValidator(this).validateAsync(group);

    if (hasValidationErrors(validation)) {
      return buildErrorResponse(validation);
    }

    const result = await this.repository.addGroup(group);
    return this.formatGroup(result);
  }

  async getGroupByHashtag(hashtag: string): Promise<GroupModel> {
    const result = await this.repository.getGroupByHashtag(hashtag);
    return result != undefined ? this.formatGroup(result) : undefined;
  }

  async getGroups(): Promise<GroupModel[]> {
    let groups = (await this.repository.getGroups()) as GroupModel[];
    return groups.map(this.formatGroup);
  }

  async getHashtagAvailability(hashtag: string): Promise<boolean> {
    const group = await this.getGroupByHashtag(hashtag);
    return group == null || group == undefined;
  }

  private formatGroup(group: GroupModel): GroupModel {
    group.adminKey = undefined;
    return group;
  }
}
