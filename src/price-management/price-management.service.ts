import { Injectable, HttpStatus } from '@nestjs/common';
import { PriceManagementRepositoryService } from '../models/priceManagement/priceManagement.service';
import { BottleType, ApiResponse } from 'src/types/types';
import { PRICE_MESSAGES } from 'src/common/constants/messages.constant';

interface PriceManagePayload {
  bottleType: BottleType;
  perBottlePrice: number;
  labelCapPrice: number;
  otherExpenses: number;
}

@Injectable()
export class PriceManagementService {
  constructor(private readonly priceMange: PriceManagementRepositoryService) {}

  async priceRegister(payload: PriceManagePayload): Promise<ApiResponse> {
    const createdPrice = await this.priceMange.createPriceRegistry(payload);

    return {
      status: HttpStatus.CREATED,
      message: PRICE_MESSAGES.SUCCESS.CREATED,
      data: createdPrice,
    };
  }

  async fetchAllPrice(): Promise<ApiResponse> {
    const allPrices = await this.priceMange.findAllPrices();

    return {
      status: HttpStatus.OK,
      message: PRICE_MESSAGES.SUCCESS.FETCHED,
      data: allPrices,
    };
  }
}
