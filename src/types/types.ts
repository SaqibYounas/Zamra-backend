export enum BottleType {
  SMALL = '500ml',
  LARGE = '1.5L',
  GALLON = '19L',
}

export interface ApiResponse {
  status: number;
  message?: string;
  data?: any;
}
export class ForceBuildTrigger {}
