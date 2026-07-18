import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellingRate } from './selling-price.entity';

@Injectable()
export class SellingRateRepositoryService {
  constructor(
    @InjectRepository(SellingRate)
    private readonly sellingRateRepository: Repository<SellingRate>,
  ) {}

  async createSellingRate(
    sellingData: Partial<SellingRate>,
  ): Promise<SellingRate> {
    await this.sellingRateRepository.update(
      {
        priceManagementId: sellingData.priceManagementId,
        isActive: true,
      },
      {
        isActive: false,
      },
    );

    const newSellingRate = this.sellingRateRepository.create({
      ...sellingData,
      isActive: true,
    });

    return await this.sellingRateRepository.save(newSellingRate);
  }

  async findAllSellingRates(): Promise<SellingRate[]> {
    return await this.sellingRateRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        priceManagement: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findActiveSellingRateByPriceId(
    priceManagementId: number,
  ): Promise<SellingRate> {
    const sellingRate = await this.sellingRateRepository.findOne({
      where: {
        priceManagementId,
        isActive: true,
      },
      relations: {
        priceManagement: true,
      },
    });

    if (!sellingRate) {
      throw new NotFoundException(
        `No active selling rate found for price id ${priceManagementId}`,
      );
    }

    return sellingRate;
  }
}
