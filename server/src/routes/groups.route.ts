import { Router } from 'express';
import { GroupsService } from '../services/groups.service';

export function GroupsRouter(service: GroupsService): Router {
  return Router();
}
