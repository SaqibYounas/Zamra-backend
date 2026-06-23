import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DailyStockServices } from './daily-stock.service';
import { AuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateDailyStockDto } from './dto/daily-stock.dto';
import { ApiResponse } from 'src/types/types';

@Controller('daily-stock')
export class DailyStockController {
  constructor(private readonly dailyStock: DailyStockServices) {}

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
