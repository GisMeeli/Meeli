import { GroupModel } from '../../../models/group.model';
import { GroupsRepository } from '../../../repositories/groups.repository';
import { getDatabaseConnection } from '../connection-manager';
import { GroupEntity } from '../entity/group.entity';

export class GroupsDao implements GroupsRepository {
  async addGroup(group: GroupModel): Promise<GroupModel> {
    const result = await (await getDatabaseConnection())
      .createQueryBuilder()
      .insert()
      .into(GroupEntity)
      .values(group)
      .returning('*')
      .execute();

    return result.generatedMaps[0] as GroupModel;
  }
  getGroup(hashtag: string): GroupModel {
    throw new Error('Method not implemented.');
  }
  getGroups(): GroupModel[] {
    throw new Error('Method not implemented.');
  }
}
