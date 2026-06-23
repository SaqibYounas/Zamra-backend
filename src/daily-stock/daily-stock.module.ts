import { Module } from '@nestjs/common';
import { DailyStockController } from './daily-stock.controller';
import { DailyStockServices } from './daily-stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyStock } from './dailyStock.entity';
@Module({
  imports: [TypeOrmModule.forFeature([DailyStock])],
  controllers: [DailyStockController],
  providers: [DailyStockServices],
})
export class DailyStockModule {}
