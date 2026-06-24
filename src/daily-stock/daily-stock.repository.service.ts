import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStock } from './dailyStock.entity';
import { PriceManagement } from '../price-management/priceManagement.entity';

@Injectable()
export class DailyStockRepositoryServices {
  constructor(
    @InjectRepository(DailyStock)
    private readonly dailyStockRepository: Repository<DailyStock>,
    @InjectRepository(PriceManagement)
    private readonly priceManagementRepository: Repository<PriceManagement>,
  ) {}

  async createDailyStockRegistry(
    stockData: Partial<DailyStock>,
  ): Promise<DailyStock> {
    const activePrice = await this.priceManagementRepository.findOne({
      where: { isActive: true } as any,
    });

    if (!activePrice) {
      throw new NotFoundException(
        'No active price management record found. Please activate a price rate first.',
      );
    }

    const newStockRecord = this.dailyStockRepository.create({
      ...stockData,
      priceManagement: activePrice,
    });

    return await this.dailyStockRepository.save(newStockRecord);
  }

  async findAllStocks(): Promise<DailyStock[]> {
    return await this.dailyStockRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
