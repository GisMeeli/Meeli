import { AsyncValidator } from 'fluentvalidation-ts';
import { GroupModel } from '../models/group.model';
import { GroupsService } from '../services/groups.service';

export class GroupModelValidator extends AsyncValidator<GroupModel> {
  constructor(service: GroupsService) {
    super();

    this.ruleFor('category').notNull().withMessage('Debe especificar una categoría para el grupo.');
    this.ruleFor('name').notEmpty().withMessage('El nombre del grupo no puede estar vacío.');
    this.ruleFor('adminKey').notEmpty().withMessage('Debe especificar una clave de administrador.');
    this.ruleFor('hashtag').notEmpty().withMessage('El hashtag no puede estar vacío.');
    this.ruleFor('hashtag')
      .mustAsync(async (hashtag) => await service.getHashtagAvailability(hashtag))
      .withMessage('El hashtag no está disponible.');
  }
}
