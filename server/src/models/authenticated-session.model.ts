import { GroupCategoryModel } from "./group-category.model";

export interface AuthenticatedSessionModel {
  sessionId: string;
  groupId: string;
  groupCategory: GroupCategoryModel;
  memberId: string;
}
