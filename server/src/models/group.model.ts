import { Model } from '../abstractions/model';
import { GroupCategoryModel } from './group-category.model';

export interface GroupModel extends Model {
  id: string;
  category: GroupCategoryModel;
  hashtag: string;
  name: string;
  description: string;
  adminKey: string;
  customAttributes: JSON;
  creation: Date;
}
