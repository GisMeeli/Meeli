export interface MeeliRequest {
  action: MeeliAction;
  data: any;
}

export enum MeeliAction {
  UpdateLocation = 1,
  UpdateStatus = 2
}

export interface MeeliPoint {
  lat: number;
  lon: number;
}

export interface MeeliTaxiStatusUpdate {
  isAvailable: boolean;
  rideCount: number;
}
