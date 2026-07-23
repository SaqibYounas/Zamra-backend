import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateDailyStockDto } from './dto/daily-stock.dto';
import { ApiResponse } from '@app-types/types';
import { DailyStockervice } from './dailyStock.service';
@Controller('daily-stock')
export class DailyStockController {
  constructor(private readonly dailyStock: DailyStockervice) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getAllStocks(): Promise<ApiResponse> {
    return await this.dailyStock.findAllStocks();
  }

  @UseGuards(AuthGuard)
  @Get('/today')
  async getTodayStocks(): Promise<ApiResponse> {
    return await this.dailyStock.findTodayStocks();
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async createStock(
    @Body() payload: CreateDailyStockDto,
  ): Promise<ApiResponse> {
    return await this.dailyStock.createDailyStockRegistry(payload);
  }
}
