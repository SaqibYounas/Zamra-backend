import {
  Injectable,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { PriceManagementRepositoryService } from '../models/priceManagement/priceManagement.service';
import { BottleType } from '../models/priceManagement/priceManagement.entity';

export interface PriceManagePayload {
  bottleType: BottleType;
  perBottlePrice: number;
  labelCapPrice: number;
  otherExpenses: number;
}

export interface ApiResponse {
  status: number;
  message?: string;
  data?: any;
}

@Injectable()
export class PriceManagementService {
  constructor(private readonly priceMange: PriceManagementRepositoryService) {}

  async priceRegister(payload: PriceManagePayload): Promise<ApiResponse> {
    try {
      await this.priceMange.createPriceRegistry(payload);

      return {
        status: HttpStatus.CREATED,
        message: 'Price registry created successfully',
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new InternalServerErrorException('Failed to save price registry');
    }
  }

  async fetchAllPrice(): Promise<ApiResponse> {
    try {
      const allPrices = await this.priceMange.findAllPrices();

      return {
        status: HttpStatus.OK,
        message: 'Prices fetched successfully',
        data: allPrices,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new InternalServerErrorException('Failed to fetch price registry');
    }
  }
}
