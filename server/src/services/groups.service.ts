import { Service } from '../abstractions/service';
import { GroupCollaboratorModel } from '../models/group-collaborator.model';
import { GroupMemberRoleModel } from '../models/group-member-role.model';
import { GroupModel } from '../models/group.model';
import { LoginRequestModel } from '../models/login-request.model';
import { GroupsRepository } from '../repositories/groups.repository';
import { buildErrorResponse } from '../utils/service-response-handler';
import { GroupCollaboratorModelValidator } from '../validators/group-collaborator-model.validator';
import { GroupModelValidator } from '../validators/group-model.validator';
import { hasValidationErrors } from '../validators/validator-utils';
import jwt from 'jsonwebtoken';

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

    const currentCollaborators = await this.getGroupCollaborators(collaborator.group);
    if (currentCollaborators.map((c) => c.name).includes(collaborator.name)) {
      return buildErrorResponse({
        message: `Ya existe un colaborador con el nombre '${collaborator.name}' en este grupo.`
      });
    }
    if (currentCollaborators.map((c) => c.key).includes(collaborator.key)) {
      return buildErrorResponse({
        message: `Ya existe un colaborador con la misma clave en este grupo.`
      });
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

  async getGroupCollaborator(collaboratorId: string): Promise<GroupCollaboratorModel> {
    return this.repository.getGroupCollaborator(collaboratorId);
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

  async login(loginRequest: LoginRequestModel): Promise<{ groupId: string; collaboratorId: string; name: string }> {
    if (loginRequest.role == GroupMemberRoleModel.Administrator) {
      const group = await this.getGroupById(loginRequest.group);

      if (group.adminKey == loginRequest.key) {
        return {
          groupId: loginRequest.group,
          collaboratorId: 'admin',
          name: 'admin'
        };
        // return {
        //   name: 'admin',
        //   token: this.generateSession(loginRequest.group, 'admin')
        // };
      } else {
        return buildErrorResponse({ message: 'Clave de administrador inválida.' });
      }
    } else {
      const collaborators = await this.getGroupCollaborators(loginRequest.group);
      if (collaborators.map((c) => c.key).includes(loginRequest.key)) {
        const targetCollaborator = collaborators.find((c) => c.key === loginRequest.key);
        return {
          groupId: loginRequest.group,
          collaboratorId: targetCollaborator.id,
          name: targetCollaborator.name
        };
        // return {
        //   name: targetCollaborator.name,
        //   token: this.generateSession(loginRequest.group, targetCollaborator.id)
        // };
      }
    }

    return buildErrorResponse({ message: 'Clave de colaborador inválida.' });
  }

  /*
  private generateSession(groupId: string, memberId: string): any {
    return jwt.sign(
      {
        group: groupId,
        member: memberId,
        creation: Date.now()
      },
      process.env.SERVER_JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );
  }
  */

  private formatGroup(group: GroupModel): GroupModel {
    group.adminKey = undefined;
    return group;
  }
}
