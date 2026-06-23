import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyStock } from './dailyStock.entity';
import { DailyStockRepositoryService } from './dailyStock.service';
@Module({
  imports: [TypeOrmModule.forFeature([DailyStock])],
  controllers: [],
  providers: [DailyStockRepositoryService],
  exports: [DailyStockRepositoryService],
})
export class DailyStockModule {}
