import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStock } from './dailyStock.entity';

@Injectable()
export class DailyStockervice {
  constructor(
    @InjectRepository(DailyStock)
    private readonly dailyStockRepository: Repository<DailyStock>,
  ) {}

  async createDailyStockRegistry(
    stockData: Partial<DailyStock>,
  ): Promise<DailyStock> {
    const newStockRecord = this.dailyStockRepository.create(stockData);
    return await this.dailyStockRepository.save(newStockRecord);
  }

  async findAllStocks(): Promise<DailyStock[]> {
    return await this.dailyStockRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // async findStockById(id: number): Promise<DailyStock> {
  //   const stock = await this.dailyStockRepository.findOne({
  //     where: { id },
  //   });

  //   if (!stock) {
  //     throw new NotFoundException(
  //       `Daily stock record with ID ${id} not found.`,
  //     );
  //   }

  //   return stock;
  // }
}
