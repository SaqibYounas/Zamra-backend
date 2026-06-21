import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyStock } from './dailyStock.entity';

@Injectable()
export class DailyStockService {
  constructor(
    @InjectRepository(DailyStock)
    private readonly DailyStockRepository: Repository<DailyStock>,
  ) {}

  async createCompany(userData: Partial<DailyStock>): Promise<DailyStock> {
    return this.DailyStockRepository.save(userData);
  }

  async findAll(): Promise<DailyStock[]> {
    return this.DailyStockRepository.find();
  }
}
