export interface MeeliRequest {
  action: MeeliAction;
  data: any;
}

export enum MeeliAction {
  UpdateLocation = 1
}

export interface MeeliPoint {
  lat: number;
  lon: number;
}
