import { Injectable, HttpStatus } from '@nestjs/common';
import { DailyStockRepositoryService } from './dailyStock.service';
import { STOCK_MESSAGES } from 'src/common/constants/messages.constant';
import { ApiResponse, BottleType } from 'src/types/types';

interface DailyStockPayload {
  bottleType: BottleType;
  totalPet: number;
  bottlePerPet: number;
}

@Injectable()
export class DailyStockServices {
  constructor(private readonly dailyStock: DailyStockRepositoryService) {}

  async registerStock(payload: DailyStockPayload): Promise<ApiResponse> {
    const createStock = await this.dailyStock.createDailyStockRegistry(payload);

    return {
      status: HttpStatus.CREATED,
      message: STOCK_MESSAGES.SUCCESS.CREATED,
      data: createStock,
    };
  }

  async fetchAllStocks(): Promise<ApiResponse> {
    const allStocks = await this.dailyStock.findAllStocks();

    return {
      status: HttpStatus.OK,
      message: STOCK_MESSAGES.SUCCESS.FETCHED,
      data: allStocks,
    };
  }
}
