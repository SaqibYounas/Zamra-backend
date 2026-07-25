import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellingRate } from '../selling-price/selling-price.entity';

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(SellingRate)
    private readonly sellingRateRepo: Repository<SellingRate>,
  ) {}

  async getProfit() {
    const sellingRates = await this.sellingRateRepo.find({
      where: {
        isActive: true,
      },
      relations: {
        priceManagement: true,
      },
    });
    return sellingRates.map((item) => {
      const totalCost = item.priceManagement.totalCost;

      const profit = Number(item.sellingPrice) - totalCost;

      return {
        id: item.id,
        sellingPrice: Number(item.sellingPrice),
        totalCost,
        profit,
        bottleType: item.priceManagement.bottleType,
      };
    });
  }
}
