import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceManagement, BottleType } from './priceManagement.entity';

@Injectable()
export class PriceManagementRepositoryService {
  constructor(
    @InjectRepository(PriceManagement)
    private readonly priceManagRepository: Repository<PriceManagement>,
  ) {}

  async createPriceRegistry(
    priceData: Partial<PriceManagement>,
  ): Promise<PriceManagement> {
    if (!priceData.bottleType) {
      throw new BadRequestException('Bottle type is mandatory.');
    }

    await this.priceManagRepository.update(
      { bottleType: priceData.bottleType, isActive: true },
      { isActive: false },
    );

    const newPriceRecord = this.priceManagRepository.create({
      ...priceData,
      isActive: true,
    });

    return await this.priceManagRepository.save(newPriceRecord);
  }

  async findAllPrices(): Promise<PriceManagement[]> {
    return await this.priceManagRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findActivePriceByType(
    bottleType: BottleType,
  ): Promise<PriceManagement> {
    const activePrice = await this.priceManagRepository.findOne({
      where: { bottleType, isActive: true },
    });

    if (!activePrice) {
      throw new NotFoundException(
        `No active rate found in the market registry for ${bottleType}.`,
      );
    }

    return activePrice;
  }
}
export { PriceManagement };
