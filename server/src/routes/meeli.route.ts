import { Request, Response, Router } from 'express';
import { GroupCategoryModel } from '../models/group-category.model';
import { GroupsService } from '../services/groups.service';
import { MeeliService } from '../services/meeli.service';

export function MeeliRouter(meeli: MeeliService, groups: GroupsService): Router {
  return Router().get('/reports', async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const hashtag = req.query.hashtag as string | undefined;
    const collaborator = req.query.collaborator as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    let groupCategory: GroupCategoryModel;

    if (category.toLowerCase() == 'mail') groupCategory = GroupCategoryModel.Mail;
    if (category.toLowerCase() == 'taxi') groupCategory = GroupCategoryModel.Taxi;

    const result = await meeli.getRoutes(
      groupCategory,
      hashtag,
      collaborator,
      from != undefined ? new Date(from) : undefined,
      to != undefined ? new Date(to) : undefined
    );

    res.status(200).json(result);
  });
}
