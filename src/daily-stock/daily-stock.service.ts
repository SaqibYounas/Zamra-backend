import {
  Injectable,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { DailyStockRepositoryService } from '../models/dailyStock/dailyStock.service';
import { ApiResponse } from 'src/company/company.service';
import { BottleType } from 'src/types/types';

export interface DailyStockPayload {
  bottleType: BottleType;
  totalPet: number;
  bottlePerPet: number;
}

@Injectable()
export class DailyStockServices {
  constructor(private readonly dailyStock: DailyStockRepositoryService) {}

  async registerStock(payload: DailyStockPayload): Promise<ApiResponse> {
    try {
      const createStock =
        await this.dailyStock.createDailyStockRegistry(payload);

      if (!createStock) {
        throw new InternalServerErrorException(
          'Failed to generate daily stock object registry.',
        );
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Today Stock is created successfully.',
        data: createStock,
      };
    } catch (error) {
      console.error(
        'The issue is Daily Stock service register related:',
        error,
      );
      throw new InternalServerErrorException(
        'An internal server error occurred while registering stock.',
      );
    }
  }

  async fetchAllStocks(): Promise<ApiResponse> {
    try {
      const allStocks = await this.dailyStock.findAllStocks();

      return {
        status: HttpStatus.OK,
        message: 'All daily stocks fetched successfully.',
        data: allStocks,
      };
    } catch (error) {
      console.error('The issue is Daily Stock service fetch related:', error);
      throw new InternalServerErrorException(
        'An internal server error occurred while fetching stocks.',
      );
    }
  }
}
