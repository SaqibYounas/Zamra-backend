import { HttpStatus, Injectable } from '@nestjs/common';
import { DailyStockRepositoryServices } from './daily-stock.repository.service';
import { ApiResponse, BottleType } from '@app-types/types';
import { STOCK_MESSAGES } from '@common/constants/messages.constant';

interface IDailyStock {
  bottleType: BottleType;
  totalPet: number;
  bottlePerPet: number;
}

@Injectable()
export class DailyStockervice {
  constructor(
    private readonly dailyStockRepository: DailyStockRepositoryServices,
  ) {}

  async createDailyStockRegistry(stockData: IDailyStock): Promise<ApiResponse> {
    const newStockRecord =
      await this.dailyStockRepository.createDailyStockRegistry(stockData);
    return {
      status: HttpStatus.CREATED,
      message: STOCK_MESSAGES.SUCCESS.CREATED,
      data: newStockRecord,
    };
  }

  async findAllStocks(): Promise<ApiResponse> {
    const allStocks = await this.dailyStockRepository.findAllStocks();
    return {
      status: HttpStatus.OK,
      message: STOCK_MESSAGES.SUCCESS.FETCHED,
      data: allStocks,
    };
  }
}
