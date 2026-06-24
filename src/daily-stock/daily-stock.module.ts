import { Module } from '@nestjs/common';
import { DailyStockController } from './daily-stock.controller';
import { DailyStockRepositoryServices } from './daily-stock.repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyStock } from './dailyStock.entity';
import { DailyStockervice } from './dailyStock.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyStock]), AuthModule],
  controllers: [DailyStockController],
  providers: [DailyStockervice, DailyStockRepositoryServices],
})
export class DailyStockModule {}
