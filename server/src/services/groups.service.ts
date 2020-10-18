import { Service } from '../abstractions/service';
import { GroupCollaboratorModel } from '../models/group-collaborator.model';
import { GroupModel } from '../models/group.model';
import { GroupsRepository } from '../repositories/groups.repository';
import { buildErrorResponse } from '../utils/service-response-handler';
import { GroupCollaboratorModelValidator } from '../validators/group-collaborator-model.validator';
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

  async addGroupCollaborator(collaborator: GroupCollaboratorModel): Promise<GroupCollaboratorModel> {
    const validation = await new GroupCollaboratorModelValidator(this).validateAsync(collaborator);
    if (hasValidationErrors(validation)) {
      return buildErrorResponse(validation);
    }

    const result = this.repository.addGroupCollaborator(collaborator);

    if (result != undefined) {
      return result;
    } else {
      return buildErrorResponse({ message: `An error occured on collaborator insert.` });
    }
  }

  async deleteGroupCollaborator(collaboratorId: string): Promise<boolean> {
    return await this.repository.deleteGroupCollaborator(collaboratorId);
  }

  async getGroupById(id: string): Promise<GroupModel> {
    return await this.repository.getGroupById(id);
  }

  async getGroupByHashtag(hashtag: string): Promise<GroupModel> {
    const result = await this.repository.getGroupByHashtag(hashtag);
    return result != undefined ? this.formatGroup(result) : undefined;
  }

  async getGroupCollaborators(groupId: string): Promise<GroupCollaboratorModel[]> {
    return await this.repository.getGroupCollaborators(groupId);
  }

  async getGroups(): Promise<GroupModel[]> {
    let groups = (await this.repository.getGroups()) as GroupModel[];
    return groups.map(this.formatGroup);
  }

  async getHashtagAvailability(hashtag: string): Promise<boolean> {
    const group = await this.getGroupByHashtag(hashtag);
    return group == null || group == undefined;
  }

  async getGroupIdByHashtag(hashtag: string): Promise<string> {
    return (await this.getGroupByHashtag(hashtag)).id;
  }

  private formatGroup(group: GroupModel): GroupModel {
    group.adminKey = undefined;
    return group;
  }
}
