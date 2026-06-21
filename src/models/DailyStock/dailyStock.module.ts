import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyStock } from './dailyStock.entity';
import { DailyStockService } from './dailyStock.service';
@Module({
  imports: [TypeOrmModule.forFeature([DailyStock])],
  controllers: [],
  providers: [DailyStockService],
  exports: [DailyStockService],
})
export class CompanyModule {}
