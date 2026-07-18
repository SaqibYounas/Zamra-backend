import { Injectable, HttpStatus } from '@nestjs/common';
import { SellingRateRepositoryService } from './selling-price.repository.service';
import { ApiResponse } from '@app-types/types';

interface SellingPricePayload {
  sellingPrice: number;
  priceManagementId: number;
}

@Injectable()
export class SellingPriceService {
  constructor(
    private readonly sellingPriceRepository: SellingRateRepositoryService,
  ) {}

  async registerSellingPrice(
    payload: SellingPricePayload,
  ): Promise<ApiResponse> {
    const saveSellingPrice =
      await this.sellingPriceRepository.createSellingRate(payload);

    return {
      status: HttpStatus.CREATED,
      message: 'Selling price registered successfully',
      data: saveSellingPrice,
    };
  }

  async fetchAllSellingPrice(): Promise<ApiResponse> {
    const getSellingPrice =
      await this.sellingPriceRepository.findAllSellingRates();

    return {
      status: HttpStatus.CREATED,
      message: 'Fetch All Selling price successfully',
      data: getSellingPrice,
    };
  }
}
