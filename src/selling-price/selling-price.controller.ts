import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import { SellingPriceService } from './selling-price.service';
import { SellingPriceDto } from './dto/selling-price.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiResponse } from '@app-types/types';

@Controller('selling-price')
export class SellingPriceController {
  constructor(private readonly sellingPrice: SellingPriceService) {}

  @UseGuards(AuthGuard)
  @Get('')
  async getcurrentPrice(): Promise<ApiResponse> {
    return await this.sellingPrice.fetchAllSellingPrice();
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async createNewPrice(@Body() payload: SellingPriceDto): Promise<ApiResponse> {
    return await this.sellingPrice.registerSellingPrice(payload);
  }
}
