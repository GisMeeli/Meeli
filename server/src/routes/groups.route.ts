import { Router, Request, Response } from 'express';
import { GroupCollaboratorModel } from '../models/group-collaborator.model';
import { GroupModel } from '../models/group.model';
import { GroupsService } from '../services/groups.service';
import { isErrorResponse } from '../utils/service-response-handler';

export function GroupsRouter(service: GroupsService): Router {
  return Router()
    .get('/', async (req: Request, res: Response) => {
      const groups = await service.getGroups();
      res.status(200).json(groups);
    })
    .post('/', async (req: Request, res: Response) => {
      const result = await service.addGroup(req.body as GroupModel);
      if (isErrorResponse(result)) {
        res.status(400).json(result);
      } else {
        res.status(201).json(result);
      }
    })
    .get('/:hashtag', async (req: Request, res: Response) => {
      const result = await service.getGroupByHashtag(req.params.hashtag);
      if (result != undefined) {
        res.status(200).json(result);
      } else {
        res.sendStatus(404);
      }
    })
    .delete('/:hashtag/collaborators/:id', async (req: Request, res: Response) => {
      const result = await service.deleteGroupCollaborator(req.params.hashtag, req.params.id);
      
      if (!isErrorResponse(result)) {
        res.sendStatus(result ? 204 : 400);
      } else {
        res.status(400).json(result);
      }
    })
    .get('/:hashtag/collaborators', async (req: Request, res: Response) => {
      const result = await service.getGroupCollaborators(req.params.hashtag);
      if (isErrorResponse(result)) {
        res.sendStatus(404);
      } else {
        res.status(200).json(result);
      }
    })
    .post('/:hashtag/collaborators', async (req: Request, res: Response) => {
      const result = await service.addGroupCollaborator(req.params.hashtag, req.body as GroupCollaboratorModel);

      res.status(!isErrorResponse(result) ? 201 : 400).json(result);
    });
}
