import { Service } from '../abstractions/service';
import { GroupCollaboratorModel } from '../models/group-collaborator.model';
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

  async addGroupCollaborator(
    groupHashtag: string,
    collaborator: GroupCollaboratorModel
  ): Promise<GroupCollaboratorModel> {
    const targetGroup = await this.getGroupByHashtag(groupHashtag);
    if (targetGroup == undefined)
      return buildErrorResponse({ message: `No group found with hashtag '${groupHashtag}.'` });

    collaborator.group = targetGroup.id;
    const result = this.repository.addGroupCollaborator(collaborator);

    if (result != undefined) {
      return result;
    } else {
      return buildErrorResponse({ message: `An error occured on collaborator insert.` });
    }
  }

  async deleteGroupCollaborator(groupHashtag: string, collaboratorId: string): Promise<boolean> {
    const targetGroup = await this.getGroupByHashtag(groupHashtag);
    if (targetGroup == undefined) {
      return buildErrorResponse({ message: `No group with hashtag '${groupHashtag}' was found. ` });
    }

    return await this.repository.deleteGroupCollaborator(collaboratorId);
  }

  async getGroupByHashtag(hashtag: string): Promise<GroupModel> {
    const result = await this.repository.getGroupByHashtag(hashtag);
    return result != undefined ? this.formatGroup(result) : undefined;
  }

  async getGroupCollaborators(hashtag: string): Promise<GroupCollaboratorModel[]> {
    const targetGroup = await this.getGroupByHashtag(hashtag);
    if (targetGroup == undefined) {
      return buildErrorResponse({ message: `No group with hashtag '${hashtag}' was found. ` });
    }

    return await this.repository.getGroupCollaborators(targetGroup.id);
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
