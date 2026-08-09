export enum BottleType {
  SMALL = '500ml',
  LARGE = '1.5L',
  FIVE_LITER = '5L',
  GALLON = '19L',
  REFILL = '19L Refill',
}

export interface ApiResponse {
  status: number;
  message?: string;
  data?: any;
}
export class ForceBuildTrigger {}
