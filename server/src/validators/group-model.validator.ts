import { AsyncValidator } from 'fluentvalidation-ts';
import { GroupModel } from '../models/group.model';
import { GroupsService } from '../services/groups.service';

export class GroupModelValidator extends AsyncValidator<GroupModel> {
  constructor(service: GroupsService) {
    super();

    this.ruleFor('adminKey')
      .notEmpty()
      .withMessage('Admin key cannot be empty.');
    this.ruleFor('hashtag').notEmpty().withMessage('Hashtag cannot be empty.');
    this.ruleFor('hashtag')
      .mustAsync(
        async (hashtag) => await service.getHashtagAvailability(hashtag)
      )
      .withMessage('Hashtag is already taken.');
  }
}
