export enum BottleType {
  SMALL = '500ml',
  LARGE = '1.5L',
  GALLON = '19L',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  REFILL = '19L',
}

export interface ApiResponse {
  status: number;
  message?: string;
  data?: any;
}
