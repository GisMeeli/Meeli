import { Router, Request, Response } from 'express';
import { GroupsService } from '../services/groups.service';
import { SessionsService } from '../services/sessions.service';

export function TestsRouter(groups: GroupsService, sessions: SessionsService): Router {
  return Router().get('/sessions/:id', async (req: Request, res: Response) => {
    const result = await sessions.getSession(req.params.id);
    res.status(200).json(result);
  });
}
