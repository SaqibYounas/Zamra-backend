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

  async findTodayStockSummary() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    return this.dailyStockRepository
      .createQueryBuilder('stock')
      .select('stock.bottleType', 'bottleType')
      .addSelect('SUM(stock.totalPet)', 'totalPet')
      .addSelect('SUM(stock.totalPet * stock.bottlePerPet)', 'totalBottles')
      .where('stock.createdAt BETWEEN :start AND :end', {
        start,
        end,
      })
      .groupBy('stock.bottleType')
      .orderBy('totalBottles', 'DESC')
      .getRawMany();
  }
}
