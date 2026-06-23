import { Module } from '@nestjs/common';
import { DailyStockController } from './daily-stock.controller';
import { DailyStockRepositoryServices } from './daily-stock.repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyStock } from './dailyStock.entity';
import { DailyStockervice } from './dailyStock.service';
@Module({
  imports: [TypeOrmModule.forFeature([DailyStock])],
  controllers: [DailyStockController],
  providers: [DailyStockervice, DailyStockRepositoryServices],
})
export class DailyStockModule {}
