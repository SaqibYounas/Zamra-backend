import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import { PriceManagementService } from './price-management.service';
import { CreatePriceManagementDto } from './dto/price-management.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiResponse } from '@app-types/types';

@Controller('price')
export class PriceManagementController {
  constructor(private readonly priceMangement: PriceManagementService) {}

  @UseGuards(AuthGuard)
  @Get('all')
  async getcurrentPrice(): Promise<ApiResponse> {
    return await this.priceMangement.fetchAllPrice();
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async createNewPrice(
    @Body() payload: CreatePriceManagementDto,
  ): Promise<ApiResponse> {
    return await this.priceMangement.priceRegister(payload);
  }
}
