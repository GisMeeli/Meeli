import { GroupCategoryModel } from './group-category.model';

export interface MeeliRequest {
  action: MeeliAction;
  data: any;
}

export enum MeeliAction {
  UpdateLocation = 1,
  UpdateStatus = 2,
  GuestGetRealTimeInfo = 4
}

export interface MeeliPoint {
  lat: number;
  lon: number;
}

export interface MeeliTaxiStatusUpdate {
  isAvailable: boolean;
  rideCount: number;
}

export interface MeeliGuestRealtimeRequest {
  category: GroupCategoryModel;
  groups: Array<string>;
}
