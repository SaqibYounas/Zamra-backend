import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DailyStockRepositoryServices } from './daily-stock.repository.service';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateDailyStockDto } from './dto/daily-stock.dto';
import { ApiResponse } from '@app-types/types';

@Controller('daily-stock')
export class DailyStockController {
  constructor(private readonly dailyStock: DailyStockRepositoryServices) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getAllStocks(): Promise<ApiResponse> {
    return await this.dailyStock.fetchAllStocks();
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async createStock(
    @Body() payload: CreateDailyStockDto,
  ): Promise<ApiResponse> {
    return await this.dailyStock.registerStock(payload);
  }
}
