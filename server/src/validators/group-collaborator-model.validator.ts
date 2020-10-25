import { AsyncValidator } from 'fluentvalidation-ts';
import { GroupCollaboratorModel } from '../models/group-collaborator.model';
import { GroupsService } from '../services/groups.service';

export class GroupCollaboratorModelValidator extends AsyncValidator<GroupCollaboratorModel> {
  constructor(service: GroupsService) {
    super();

    this.ruleFor('group').notNull().withMessage('El identificador del grupo no puede ser nulo.');
    this.ruleFor('name').notNull().withMessage('Debe especificar un nombre para el colaborador.');
    this.ruleFor('key').notNull().withMessage('Debe especificar una clave de acceso.');
    this.ruleFor('customAttributes').notNull().withMessage('Debe especificar los atributos personalizados.');
  }
}
