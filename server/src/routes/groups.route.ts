import { Router, Request, Response } from 'express';
import { GroupModel } from '../models/group.model';
import { GroupsService } from '../services/groups.service';

export function GroupsRouter(service: GroupsService): Router {
  return Router()
    .get('/', async (req: Request, res: Response) => {})
    .post('/', async (req: Request, res: Response) => {
      try {
        const result = await service.addGroup(req.body as GroupModel);
        res.status(201).json(result);
      } catch (err) {
        res.status(400).json(err);
      }
    });
}
