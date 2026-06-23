import { Injectable, HttpStatus } from '@nestjs/common';
import { DailyStockervice } from './dailyStock.service';
import { STOCK_MESSAGES } from '../common/constants/messages.constant';
import { ApiResponse, BottleType } from '@app-types/types';

interface DailyStockPayload {
  bottleType: BottleType;
  totalPet: number;
  bottlePerPet: number;
}

@Injectable()
export class DailyStockRepositoryServices {
  constructor(private readonly dailyStock: DailyStockervice) {}

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
