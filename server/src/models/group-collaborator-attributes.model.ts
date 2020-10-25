import { Model } from '../abstractions/model';

export interface GroupCollaboratorAttributesModel extends Model {
  driverName: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
}