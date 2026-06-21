import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStock, BottleType } from './dailyStock.entity';

@Injectable()
export class DailyStockService {
  constructor(
    @InjectRepository(DailyStock)
    private readonly DailyStockRepository: Repository<DailyStock>,
  ) {}
  async createDailyStockRegistry(
    StockData: Partial<DailyStock>,
  ): Promise<DailyStock> {
    if (!StockData.bottleType) {
      throw new Error('Bottle type is mandatory.');
    }

    return await this.DailyStockRepository.save(StockData);
  }

  async findAllPrices(): Promise<DailyStock[]> {
    return await this.DailyStockRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findActivePriceByType(bottleType: BottleType): Promise<DailyStock> {
    const activePrice = await this.DailyStockRepository.findOne({
      where: { bottleType },
    });

    if (!activePrice) {
      throw new NotFoundException(
        `No active rate found in the market registry for ${bottleType}.`,
      );
    }

    return activePrice;
  }
}
