import { Module } from '@nestjs/common';
import { DailyStockController } from './daily-stock.controller';
import { DailyStockService } from './daily-stock.service';

@Module({
  controllers: [DailyStockController],
  providers: [DailyStockService],
})
export class DailyStockModule {}
