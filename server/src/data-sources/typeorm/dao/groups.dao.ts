import { GroupModel } from '../../../models/group.model';
import { GroupsRepository } from '../../../repositories/groups.repository';
import { getDatabaseConnection } from '../connection-manager';
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

  async getGroups(): Promise<GroupModel[]> {
    const results = await (await getDatabaseConnection())
      .createQueryBuilder(GroupEntity, 'group')
      .cache(5000)
      .getMany();

    return results;
  }
}
