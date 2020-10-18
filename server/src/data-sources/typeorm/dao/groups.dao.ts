import { GroupCollaboratorModel } from '../../../models/group-collaborator.model';
import { GroupModel } from '../../../models/group.model';
import { GroupsRepository } from '../../../repositories/groups.repository';
import { getDatabaseConnection } from '../connection-manager';
import { GroupCollaboratorEntity } from '../entity/group-collaborator.entity';
import { GroupEntity } from '../entity/group.entity';

export class GroupsDao implements GroupsRepository {
  async addGroup(group: GroupModel): Promise<GroupModel | any> {
    const result = await (await getDatabaseConnection())
      .createQueryBuilder()
      .insert()
      .into(GroupEntity)
      .values(group)
      .returning('*')
      .execute();

    return result.generatedMaps[0] as GroupModel;
  }

  async addGroupCollaborator(collaborator: GroupCollaboratorModel): Promise<GroupCollaboratorModel | any> {
    const result = await (await getDatabaseConnection())
      .createQueryBuilder()
      .insert()
      .into(GroupCollaboratorEntity)
      .values(collaborator)
      .returning('*')
      .execute();

    return result.generatedMaps[0] as GroupCollaboratorModel;
  }

  async deleteGroupCollaborator(id: string): Promise<boolean> {
    const result = await (await getDatabaseConnection())
      .createQueryBuilder()
      .delete()
      .from(GroupCollaboratorEntity)
      .where('id = :value', { value: id })
      .execute();

    return 0 < result.affected;
  }

  async getGroupByHashtag(hashtag: string): Promise<GroupModel | any> {
    const results = await (await getDatabaseConnection())
      .getRepository(GroupEntity)
      .createQueryBuilder('group')
      .where('group.hashtag = :value', { value: hashtag })
      .getMany();

    return 0 < results.length ? results[0] : undefined;
  }

  async getGroupById(id: string): Promise<GroupModel | any> {
    const results = await (await getDatabaseConnection())
      .getRepository(GroupEntity)
      .createQueryBuilder('group')
      .where('group.id = :value', { value: id })
      .getMany();

    return 0 < results.length ? results[0] : undefined;
  }

  async getGroupCollaborators(groupId: string) {
    const results = await (await getDatabaseConnection())
      .getRepository(GroupCollaboratorEntity)
      .createQueryBuilder('collaborator')
      .where('collaborator.group = :value', { value: groupId })
      .getMany();

    return results;
  }

  async getGroups(): Promise<GroupModel[]> {
    const results = await (await getDatabaseConnection())
      .createQueryBuilder(GroupEntity, 'group')
      .cache(5000)
      .getMany();

    return results;
  }
}
