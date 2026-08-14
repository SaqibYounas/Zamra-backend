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
    if (!sellingData.priceManagementId) {
      throw new NotFoundException('Price Management ID is required');
    }
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

  async findActiveSellingRates(): Promise<SellingRate[]> {
    const sellingRates = await this.sellingRateRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        priceManagement: true,
      },
    });

    if (sellingRates.length === 0) {
      throw new NotFoundException('No active selling rate found');
    }

    return sellingRates;
  }
}
