import { Service } from '../abstractions/service';
import { GroupsRepository } from '../repositories/groups.repository';

export class GroupsService implements Service {
  constructor(private repository: GroupsRepository) {}
}
